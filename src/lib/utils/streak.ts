// src/lib/utils/streak.ts
// Streak management utilities

import { format, isToday, isYesterday, differenceInCalendarDays, parseISO } from 'date-fns';
import type { DailyProgress, Streak } from '@/types';

/**
 * Check if a streak is still valid.
 * Streak breaks if last active day was more than 1 calendar day ago.
 */
export function isStreakActive(lastActiveDateStr: string | null): boolean {
  if (!lastActiveDateStr) return false;
  const lastActive = parseISO(lastActiveDateStr);
  return isToday(lastActive) || isYesterday(lastActive);
}

/**
 * Determine if today's daily mission target is completed.
 */
export function isTodayMissionDone(
  todayProgress: DailyProgress | null,
  targetMinutes: number
): boolean {
  if (!todayProgress) return false;
  return todayProgress.isMissionCompleted;
}

/**
 * Calculate the progress percentage of today's session.
 */
export function getTodayProgressPercent(
  minutesSpoken: number,
  targetMinutes: number
): number {
  if (targetMinutes === 0) return 0;
  return Math.min(100, Math.round((minutesSpoken / targetMinutes) * 100));
}

/**
 * Get the streak badge label based on streak count.
 */
export function getStreakBadge(streak: number): string {
  if (streak === 0) return '';
  if (streak < 3) return '🔥 Hot Start!';
  if (streak < 7) return '🔥 On Fire!';
  if (streak < 14) return '🔥 Week Warrior!';
  if (streak < 30) return '⚡ Unstoppable!';
  return '🏆 Legend!';
}

/**
 * Generate an array of the past N days as ISO date strings.
 */
export function getPastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(format(d, 'yyyy-MM-dd'));
  }
  return days;
}

/**
 * Check if a given date string has a completed progress entry.
 */
export function isDayCompleted(
  dateStr: string,
  progressList: DailyProgress[],
  targetMinutes: number
): boolean {
  const match = progressList.find((p) => p.date.startsWith(dateStr));
  if (!match) return false;
  return match.isMissionCompleted;
}

/** Format minutes as "Xm Ys" or "Xm" */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}
