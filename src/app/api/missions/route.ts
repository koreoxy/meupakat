// src/app/api/missions/route.ts
// Daily Missions API
// GET  /api/missions        → Ambil/buat misi harian user hari ini
// POST /api/missions/claim  → Klaim reward XP misi yang sudah selesai

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/db';
import { userDailyMissions, dailyMissionDefs, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

// Library misi statis — seeder untuk tabel daily_mission_defs
// Dalam produksi, data ini ada di DB. Di sini kita seed otomatis jika belum ada.
const MISSION_SEEDS = [
  { title: 'Daily Speaker', description: 'Speak for 3 minutes today', type: 'speak_time' as const, targetValue: 180, xpReward: 30, icon: '🎙️' },
  { title: 'Power Hour', description: 'Speak for 5 minutes today', type: 'speak_time' as const, targetValue: 300, xpReward: 50, icon: '⚡' },
  { title: 'Word Hunter', description: 'Look up 3 new words in the dictionary', type: 'vocab_lookup' as const, targetValue: 3, xpReward: 25, icon: '📚' },
  { title: 'Vocab Master', description: 'Bookmark 5 new vocabulary words', type: 'vocab_lookup' as const, targetValue: 5, xpReward: 40, icon: '🔖' },
  { title: 'Session Starter', description: 'Complete 1 conversation session', type: 'complete_session' as const, targetValue: 1, xpReward: 35, icon: '💬' },
  { title: 'Double Down', description: 'Complete 2 conversation sessions', type: 'complete_session' as const, targetValue: 2, xpReward: 60, icon: '🔥' },
  { title: 'Streak Keeper', description: 'Maintain your daily streak', type: 'streak_day' as const, targetValue: 1, xpReward: 20, icon: '🔗' },
];

async function ensureMissionDefs() {
  const existing = await db.select().from(dailyMissionDefs).limit(1);
  if (existing.length === 0) {
    await db.insert(dailyMissionDefs).values(MISSION_SEEDS);
  }
  return db.select().from(dailyMissionDefs);
}

async function ensureDailyMissions(userId: string, today: string) {
  // Cek apakah misi hari ini sudah dibuat
  const existing = await db
    .select()
    .from(userDailyMissions)
    .where(and(eq(userDailyMissions.userId, userId), eq(userDailyMissions.date, today)));

  if (existing.length >= 3) return existing;

  // Buat misi hari ini — pilih 3 misi berdasarkan seed deterministik (tanggal-based)
  const allDefs = await ensureMissionDefs();
  const dayNum = new Date(today).getDate();
  const monthNum = new Date(today).getMonth();
  
  // Pilih 3 misi berdasarkan rotasi tanggal agar berbeda setiap hari
  const idx1 = (dayNum + monthNum) % allDefs.length;
  const idx2 = (dayNum + monthNum + 2) % allDefs.length;
  const idx3 = (dayNum + monthNum + 4) % allDefs.length;
  const picked = [allDefs[idx1], allDefs[idx2], allDefs[idx3]].filter(
    (d, i, arr) => arr.findIndex((x) => x.id === d.id) === i
  );

  const inserts = picked.map((def) => ({
    userId,
    missionDefId: def.id,
    date: today,
    currentValue: 0,
    isCompleted: false,
    isClaimed: false,
  }));

  const inserted = await db.insert(userDailyMissions).values(inserts).returning();
  return inserted;
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = format(new Date(), 'yyyy-MM-dd');
  await ensureDailyMissions(user.id, today);

  // Ambil misi + definisi
  const missions = await db
    .select({
      id: userDailyMissions.id,
      date: userDailyMissions.date,
      currentValue: userDailyMissions.currentValue,
      isCompleted: userDailyMissions.isCompleted,
      isClaimed: userDailyMissions.isClaimed,
      title: dailyMissionDefs.title,
      description: dailyMissionDefs.description,
      type: dailyMissionDefs.type,
      targetValue: dailyMissionDefs.targetValue,
      xpReward: dailyMissionDefs.xpReward,
      icon: dailyMissionDefs.icon,
    })
    .from(userDailyMissions)
    .innerJoin(dailyMissionDefs, eq(userDailyMissions.missionDefId, dailyMissionDefs.id))
    .where(and(eq(userDailyMissions.userId, user.id), eq(userDailyMissions.date, today)));

  return NextResponse.json({ missions });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { missionId } = body;

  // Cek misi
  const missionRows = await db
    .select()
    .from(userDailyMissions)
    .where(and(eq(userDailyMissions.id, missionId), eq(userDailyMissions.userId, user.id)))
    .limit(1);

  if (!missionRows.length) return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
  const mission = missionRows[0];

  if (!mission.isCompleted) return NextResponse.json({ error: 'Mission not completed yet' }, { status: 400 });
  if (mission.isClaimed) return NextResponse.json({ error: 'Already claimed' }, { status: 400 });

  // Dapatkan XP reward dari definisi
  const defRows = await db.select().from(dailyMissionDefs).where(eq(dailyMissionDefs.id, mission.missionDefId)).limit(1);
  const xpReward = defRows[0]?.xpReward ?? 0;

  // Mark as claimed
  await db.update(userDailyMissions).set({ isClaimed: true }).where(eq(userDailyMissions.id, missionId));

  // Tambah XP ke user
  const userRows = await db.select({ currentXp: users.currentXp, weeklyXp: users.weeklyXp }).from(users).where(eq(users.id, user.id)).limit(1);
  if (userRows.length > 0) {
    await db.update(users).set({
      currentXp: userRows[0].currentXp + xpReward,
      weeklyXp: (userRows[0].weeklyXp ?? 0) + xpReward,
      updatedAt: new Date(),
    }).where(eq(users.id, user.id));
  }

  return NextResponse.json({ success: true, xpReward });
}

// PATCH /api/missions — Update progress misi
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { type, increment = 1 } = body;

  const today = format(new Date(), 'yyyy-MM-dd');

  // Temukan misi hari ini yang sesuai type dan belum selesai
  const missions = await db
    .select({
      id: userDailyMissions.id,
      currentValue: userDailyMissions.currentValue,
      isCompleted: userDailyMissions.isCompleted,
      targetValue: dailyMissionDefs.targetValue,
      type: dailyMissionDefs.type,
    })
    .from(userDailyMissions)
    .innerJoin(dailyMissionDefs, eq(userDailyMissions.missionDefId, dailyMissionDefs.id))
    .where(
      and(
        eq(userDailyMissions.userId, user.id),
        eq(userDailyMissions.date, today)
      )
    );

  const matching = missions.filter((m) => m.type === type && !m.isCompleted);
  
  for (const m of matching) {
    const newValue = m.currentValue + increment;
    const isCompleted = newValue >= m.targetValue;
    await db.update(userDailyMissions)
      .set({ currentValue: newValue, isCompleted })
      .where(eq(userDailyMissions.id, m.id));
  }

  return NextResponse.json({ success: true });
}
