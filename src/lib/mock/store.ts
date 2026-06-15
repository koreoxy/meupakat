// src/lib/mock/store.ts
// Mock data store using localStorage as persistence
// This replaces Supabase until a real backend is connected.

import type { User, Streak, DailyProgress } from '@/types';
import { format } from 'date-fns';

const KEYS = {
  USER: 'meupakat_user',
  STREAK: 'meupakat_streak',
  PROGRESS: 'meupakat_progress', // Array of DailyProgress
} as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function read<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return crypto.randomUUID();
}

// ─── User ────────────────────────────────────────────────────────────────────

export function getUser(): User | null {
  return read<User>(KEYS.USER);
}

export function saveUser(user: User): void {
  write(KEYS.USER, user);
}

export function createUser(
  fullName: string,
  email: string,
  level: User['currentLevel']
): User {
  const user: User = {
    id: generateId(),
    fullName,
    email,
    currentLevel: level,
    currentXp: 0,
    dailyTargetMinutes: 10,
    createdAt: new Date().toISOString(),
  };
  saveUser(user);
  return user;
}

export function updateUser(updates: Partial<User>): User | null {
  const user = getUser();
  if (!user) return null;
  const updated = { ...user, ...updates };
  saveUser(updated);
  return updated;
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.USER);
}

// ─── Streak ──────────────────────────────────────────────────────────────────

export function getStreak(): Streak | null {
  return read<Streak>(KEYS.STREAK);
}

export function saveStreak(streak: Streak): void {
  write(KEYS.STREAK, streak);
}

export function getOrCreateStreak(userId: string): Streak {
  const existing = getStreak();
  if (existing) return existing;
  const streak: Streak = {
    id: generateId(),
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  };
  saveStreak(streak);
  return streak;
}

/**
 * Update streak after a successful mission completion today.
 * Follows PRD rules: streak += 1 if target met, reset to 0 if day skipped.
 */
export function updateStreakAfterMission(userId: string): Streak {
  const streak = getOrCreateStreak(userId);
  const today = format(new Date(), 'yyyy-MM-dd');

  // Already counted today
  if (streak.lastActiveDate?.startsWith(today)) return streak;

  const yesterday = format(
    new Date(Date.now() - 86400000),
    'yyyy-MM-dd'
  );
  const wasYesterday = streak.lastActiveDate?.startsWith(yesterday);
  const newStreak =
    wasYesterday || streak.currentStreak === 0
      ? streak.currentStreak + 1
      : 1; // reset

  const updated: Streak = {
    ...streak,
    currentStreak: newStreak,
    longestStreak: Math.max(streak.longestStreak, newStreak),
    lastActiveDate: new Date().toISOString(),
  };
  saveStreak(updated);
  return updated;
}

// ─── Daily Progress ──────────────────────────────────────────────────────────

export function getAllProgress(): DailyProgress[] {
  return read<DailyProgress[]>(KEYS.PROGRESS) ?? [];
}

export function getTodayProgress(userId: string): DailyProgress | null {
  const today = format(new Date(), 'yyyy-MM-dd');
  const all = getAllProgress();
  return all.find((p) => p.userId === userId && p.date.startsWith(today)) ?? null;
}

export function getWeeklyProgress(userId: string): DailyProgress[] {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const all = getAllProgress();
  return all.filter(
    (p) => p.userId === userId && new Date(p.date) >= sevenDaysAgo
  );
}

/**
 * Upsert today's progress. Creates if absent, merges minutesSpoken if present.
 */
export function upsertTodayProgress(
  userId: string,
  minutesToAdd: number,
  targetMinutes: number
): DailyProgress {
  const today = format(new Date(), 'yyyy-MM-dd');
  const all = getAllProgress();
  const existingIdx = all.findIndex(
    (p) => p.userId === userId && p.date.startsWith(today)
  );

  if (existingIdx !== -1) {
    const newMinutes = all[existingIdx].minutesSpoken + minutesToAdd;
    const updated: DailyProgress = {
      ...all[existingIdx],
      minutesSpoken: newMinutes,
      isMissionCompleted: newMinutes >= targetMinutes,
    };
    all[existingIdx] = updated;
    write(KEYS.PROGRESS, all);
    return updated;
  }

  const newEntry: DailyProgress = {
    id: generateId(),
    userId,
    date: new Date().toISOString(),
    minutesSpoken: minutesToAdd,
    isMissionCompleted: minutesToAdd >= targetMinutes,
  };
  all.push(newEntry);
  write(KEYS.PROGRESS, all);
  return newEntry;
}
