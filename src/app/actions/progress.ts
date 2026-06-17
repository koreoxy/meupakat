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

export async function getTodayProgress(clientDate?: string): Promise<DailyProgress | null> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return null;

  const today = clientDate || format(new Date(), 'yyyy-MM-dd');

  // Sync target harian jika hari baru terdeteksi
  const userRows = await db
    .select({
      dailyTargetMinutes: users.dailyTargetMinutes,
      nextDailyTargetMinutes: users.nextDailyTargetMinutes
    })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (userRows.length > 0) {
    const user = userRows[0];
    if (user.dailyTargetMinutes !== user.nextDailyTargetMinutes) {
      // Periksa apakah record hari ini sudah lengkap targetnya
      const todayProgressCheck = await db
        .select()
        .from(dailyProgress)
        .where(
          and(
            eq(dailyProgress.userId, authUser.id),
            eq(dailyProgress.date, today)
          )
        )
        .limit(1);

      const todayIsDone = todayProgressCheck.length > 0 && todayProgressCheck[0].isMissionCompleted;
      if (!todayIsDone) {
        await db
          .update(users)
          .set({
            dailyTargetMinutes: user.nextDailyTargetMinutes,
            updatedAt: new Date(),
          })
          .where(eq(users.id, authUser.id));
      }
    }
  }

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

  if (result.length === 0) {
    const inserted = await db
      .insert(streaks)
      .values({
        userId: authUser.id,
        currentStreak: 0,
        longestStreak: 0,
      })
      .returning();

    if (inserted.length === 0) return null;
    const row = inserted[0];
    return {
      id: row.id,
      userId: row.userId,
      currentStreak: row.currentStreak,
      longestStreak: row.longestStreak,
      lastActiveDate: row.lastActiveDate?.toISOString() ?? null,
    };
  }

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
 * 1. Upsert daily_progress (tambah secondsSpoken)
 * 2. Cek apakah target harian tercapai
 * 3. Jika ya → update/increment streak, deteksi & reset jika bolong
 * 4. Tambah XP ke user (Base 50 + Streak * 2 + AI Score)
 */
export async function completeSession(
  secondsSpoken: number,
  aiPerformanceScore: number,
  clientDate?: string
): Promise<CompleteSessionResult> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) {
    return { success: false, xpGained: 0, didLevelUp: false, isMissionCompleted: false, newStreak: 0, error: 'Not authenticated.' };
  }

  // Ambil data user (butuh daily target)
  const userRows = await db
    .select({ dailyTargetMinutes: users.dailyTargetMinutes })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (userRows.length === 0) {
    return { success: false, xpGained: 0, didLevelUp: false, isMissionCompleted: false, newStreak: 0, error: 'User not found.' };
  }

  const { dailyTargetMinutes } = userRows[0];
  const targetSeconds = dailyTargetMinutes * 60;
  const today = clientDate || format(new Date(), 'yyyy-MM-dd');

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

  let totalSeconds = 0;
  let isMissionCompleted = false;

  if (existing.length > 0) {
    totalSeconds = existing[0].secondsSpoken + secondsSpoken;
    isMissionCompleted = totalSeconds >= targetSeconds;

    await db
      .update(dailyProgress)
      .set({
        secondsSpoken: totalSeconds,
        minutesSpoken: Math.floor(totalSeconds / 60),
        isMissionCompleted,
      })
      .where(eq(dailyProgress.id, existing[0].id));
  } else {
    totalSeconds = secondsSpoken;
    isMissionCompleted = totalSeconds >= targetSeconds;

    await db.insert(dailyProgress).values({
      userId: authUser.id,
      date: today,
      secondsSpoken: totalSeconds,
      minutesSpoken: Math.floor(totalSeconds / 60),
      isMissionCompleted,
    });
  }

  // ─── 2. Fetch/Reset/Update streak ───────────────────────────────────────────
  let currentStreakVal = 0;

  let streakRows = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, authUser.id))
    .limit(1);

  if (streakRows.length === 0) {
    const inserted = await db
      .insert(streaks)
      .values({
        userId: authUser.id,
        currentStreak: 0,
        longestStreak: 0,
      })
      .returning();
    streakRows = inserted;
  }

  if (streakRows.length > 0) {
    const streak = streakRows[0];
    const lastActive = streak.lastActiveDate;

    // Check if streak was broken (last active date was before yesterday)
    const isStreakBroken = lastActive && !isToday(lastActive) && !isYesterday(lastActive);
    let currentStreakTemp = isStreakBroken ? 0 : streak.currentStreak;

    // Update streak if mission completed today
    if (isMissionCompleted) {
      const alreadyCountedToday = lastActive && isToday(lastActive);

      if (!alreadyCountedToday) {
        const wasYesterday = lastActive ? isYesterday(lastActive) : false;
        currentStreakVal = wasYesterday ? currentStreakTemp + 1 : 1;
        const newLongest = Math.max(streak.longestStreak, currentStreakVal);

        await db
          .update(streaks)
          .set({
            currentStreak: currentStreakVal,
            longestStreak: newLongest,
            lastActiveDate: new Date(),
          })
          .where(eq(streaks.id, streak.id));
      } else {
        currentStreakVal = currentStreakTemp;
      }
    } else {
      // If mission not completed today, but streak broken, save the reset state
      if (isStreakBroken) {
        await db
          .update(streaks)
          .set({
            currentStreak: 0,
          })
          .where(eq(streaks.id, streak.id));
      }
      currentStreakVal = currentStreakTemp;
    }
  }

  // ─── 3. Tambah XP ──────────────────────────────────────────────────────────
  const xpGained = calculateSessionXp(currentStreakVal, aiPerformanceScore);
  const xpResult = await addXp(xpGained);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/mission/[scenarioId]');

  return {
    success: true,
    xpGained,
    didLevelUp: xpResult.didLevelUp,
    isMissionCompleted,
    newStreak: currentStreakVal,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapDbProgress(row: {
  id: string;
  userId: string;
  date: string;
  minutesSpoken: number;
  secondsSpoken: number;
  isMissionCompleted: boolean;
  createdAt: Date;
}): DailyProgress {
  return {
    id: row.id,
    userId: row.userId,
    date: row.createdAt.toISOString(),
    minutesSpoken: row.minutesSpoken,
    secondsSpoken: row.secondsSpoken,
    isMissionCompleted: row.isMissionCompleted,
  };
}
