'use server';
// src/app/actions/progress.ts
// Server Actions untuk manajemen daily progress dan streak
// Implementasi PRD Acceptance Criteria:
//   - Streak +1 jika minutes_spoken >= daily_target_minutes sebelum 23:59
//   - Streak reset ke 0 jika hari terlewat

import { db } from '@/db';
import { dailyProgress, streaks, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentAuthUser } from './auth';
import { addXp } from './user';
import { calculateSessionXp } from '@/lib/utils/xp';
import { format, parseISO, isYesterday, isToday } from 'date-fns';
import { revalidatePath } from 'next/cache';
import type { DailyProgress, Streak, UserLevel } from '@/types';

// ─── Get Today's Progress ─────────────────────────────────────────────────────

export async function getTodayProgress(): Promise<DailyProgress | null> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return null;

  const today = format(new Date(), 'yyyy-MM-dd');
  const result = await db
    .select()
    .from(dailyProgress)
    .where(
      and(
        eq(dailyProgress.userId, authUser.id),
        eq(dailyProgress.date, today)
      )
    )
    .limit(1);

  if (result.length === 0) return null;
  return mapDbProgress(result[0]);
}

// ─── Get Weekly Progress ──────────────────────────────────────────────────────

export async function getWeeklyProgress(): Promise<DailyProgress[]> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return [];

  // Ambil 7 hari terakhir
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return format(d, 'yyyy-MM-dd');
  });

  const results = await db
    .select()
    .from(dailyProgress)
    .where(eq(dailyProgress.userId, authUser.id));

  // Filter hanya 7 hari terakhir
  return results
    .filter((r) => dates.includes(r.date))
    .map(mapDbProgress);
}

// ─── Get Streak ───────────────────────────────────────────────────────────────

export async function getUserStreak(): Promise<Streak | null> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return null;

  const result = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, authUser.id))
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    userId: row.userId,
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    lastActiveDate: row.lastActiveDate?.toISOString() ?? null,
  };
}

// ─── Complete Session ─────────────────────────────────────────────────────────

export interface CompleteSessionResult {
  success: boolean;
  xpGained: number;
  didLevelUp: boolean;
  isMissionCompleted: boolean;
  newStreak: number;
  error?: string;
}

/**
 * Simpan hasil sesi berbicara. Dipanggil dari ConversationPlayer setelah selesai.
 *
 * Alur:
 * 1. Upsert daily_progress (tambah minutesSpoken)
 * 2. Cek apakah target harian tercapai
 * 3. Jika ya → update streak
 * 4. Tambah XP ke user
 */
export async function completeSession(
  minutesSpoken: number
): Promise<CompleteSessionResult> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) {
    return { success: false, xpGained: 0, didLevelUp: false, isMissionCompleted: false, newStreak: 0, error: 'Not authenticated.' };
  }

  // Ambil data user (butuh level dan daily target)
  const userRows = await db
    .select({ dailyTargetMinutes: users.dailyTargetMinutes, currentLevel: users.currentLevel })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (userRows.length === 0) {
    return { success: false, xpGained: 0, didLevelUp: false, isMissionCompleted: false, newStreak: 0, error: 'User not found.' };
  }

  const { dailyTargetMinutes, currentLevel } = userRows[0];
  const today = format(new Date(), 'yyyy-MM-dd');

  // ─── 1. Upsert daily progress ───────────────────────────────────────────────
  const existing = await db
    .select()
    .from(dailyProgress)
    .where(
      and(
        eq(dailyProgress.userId, authUser.id),
        eq(dailyProgress.date, today)
      )
    )
    .limit(1);

  let totalMinutes: number;
  let isMissionCompleted: boolean;

  if (existing.length > 0) {
    totalMinutes = existing[0].minutesSpoken + minutesSpoken;
    isMissionCompleted = totalMinutes >= dailyTargetMinutes;

    await db
      .update(dailyProgress)
      .set({
        minutesSpoken: totalMinutes,
        isMissionCompleted,
      })
      .where(eq(dailyProgress.id, existing[0].id));
  } else {
    totalMinutes = minutesSpoken;
    isMissionCompleted = totalMinutes >= dailyTargetMinutes;

    await db.insert(dailyProgress).values({
      userId: authUser.id,
      date: today,
      minutesSpoken: totalMinutes,
      isMissionCompleted,
    });
  }

  // ─── 2. Update streak jika mission selesai ──────────────────────────────────
  let newStreak = 0;

  if (isMissionCompleted) {
    const streakRows = await db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, authUser.id))
      .limit(1);

    if (streakRows.length > 0) {
      const streak = streakRows[0];
      const lastActive = streak.lastActiveDate;

      // Sudah dihitung hari ini
      const alreadyCountedToday =
        lastActive && isToday(lastActive);

      if (!alreadyCountedToday) {
        const wasYesterday = lastActive ? isYesterday(lastActive) : false;
        const newCurrentStreak = wasYesterday ? streak.currentStreak + 1 : 1;
        const newLongest = Math.max(streak.longestStreak, newCurrentStreak);
        newStreak = newCurrentStreak;

        await db
          .update(streaks)
          .set({
            currentStreak: newCurrentStreak,
            longestStreak: newLongest,
            lastActiveDate: new Date(),
          })
          .where(eq(streaks.id, streak.id));
      } else {
        newStreak = streak.currentStreak;
      }
    }
  }

  // ─── 3. Tambah XP ──────────────────────────────────────────────────────────
  const xpGained = calculateSessionXp(currentLevel as UserLevel, minutesSpoken);
  const xpResult = await addXp(xpGained);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/mission/[scenarioId]');

  return {
    success: true,
    xpGained,
    didLevelUp: xpResult.didLevelUp,
    isMissionCompleted,
    newStreak,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapDbProgress(row: {
  id: string;
  userId: string;
  date: string;
  minutesSpoken: number;
  isMissionCompleted: boolean;
  createdAt: Date;
}): DailyProgress {
  return {
    id: row.id,
    userId: row.userId,
    date: row.createdAt.toISOString(),
    minutesSpoken: row.minutesSpoken,
    isMissionCompleted: row.isMissionCompleted,
  };
}
