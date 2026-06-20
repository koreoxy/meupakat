// src/app/api/leaderboard/route.ts
// Global Leaderboard API
// GET /api/leaderboard → Ambil top 50 user berdasarkan weeklyXp

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      currentXp: users.currentXp,
      weeklyXp: users.weeklyXp,
      currentLevel: users.currentLevel,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .orderBy(desc(users.weeklyXp))
    .limit(50);

  const leaderboard = rows.map((u, idx) => ({
    rank: idx + 1,
    id: u.id,
    fullName: u.fullName,
    avatar: u.fullName ? u.fullName[0].toUpperCase() : '?',
    currentXp: u.currentXp,
    weeklyXp: u.weeklyXp ?? 0,
    currentLevel: u.currentLevel,
    isCurrentUser: u.id === user.id,
  }));

  return NextResponse.json({ leaderboard });
}
