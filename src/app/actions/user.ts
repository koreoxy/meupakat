'use server';
// src/app/actions/user.ts
// Server Actions untuk manajemen data profil user

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentAuthUser } from './auth';
import { revalidatePath } from 'next/cache';
import type { User, UserLevel } from '@/types';
import { checkLevelUp, getLevelCategory } from '@/lib/utils/xp';

// ─── Get User Profile ─────────────────────────────────────────────────────────

/**
 * Ambil profil user dari database berdasarkan auth session.
 * Return null jika tidak login atau profil belum dibuat.
 */
export async function getUserProfile(): Promise<User | null> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return null;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    currentLevel: row.currentLevel as UserLevel,
    currentXp: row.currentXp,
    dailyTargetMinutes: row.dailyTargetMinutes,
    avatarUrl: row.avatarUrl ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

// ─── Update Daily Target ──────────────────────────────────────────────────────

export interface UpdateTargetResult {
  success: boolean;
  error?: string;
}

/**
 * Update daily target menit user.
 * Validasi: harus salah satu dari [5, 10, 15, 30, 60].
 */
export async function updateDailyTarget(
  minutes: number
): Promise<UpdateTargetResult> {
  const validOptions = [5, 10, 15, 30, 60];
  if (!validOptions.includes(minutes)) {
    return { success: false, error: 'Invalid target minutes value.' };
  }

  const authUser = await getCurrentAuthUser();
  if (!authUser) {
    return { success: false, error: 'Not authenticated.' };
  }

  await db
    .update(users)
    .set({
      dailyTargetMinutes: minutes,
      updatedAt: new Date(),
    })
    .where(eq(users.id, authUser.id));

  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard');
  return { success: true };
}

// ─── Add XP ───────────────────────────────────────────────────────────────────

export interface AddXpResult {
  success: boolean;
  newXp: number;
  didLevelUp: boolean;
  error?: string;
}

/**
 * Tambah XP ke user. Deteksi level-up otomatis.
 */
export async function addXp(amount: number): Promise<AddXpResult> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) {
    return { success: false, newXp: 0, didLevelUp: false, error: 'Not authenticated.' };
  }

  const current = await db
    .select({ currentXp: users.currentXp, currentLevel: users.currentLevel })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (current.length === 0) {
    return { success: false, newXp: 0, didLevelUp: false, error: 'User not found.' };
  }

  const { currentXp, currentLevel } = current[0];
  const newXp = currentXp + amount;

  // Tentukan level baru berdasarkan XP threshold
  const newLevel = getLevelCategory(newXp);
  const didLevelUp = checkLevelUp(currentXp, newXp);

  await db
    .update(users)
    .set({
      currentXp: newXp,
      currentLevel: newLevel,
      updatedAt: new Date(),
    })
    .where(eq(users.id, authUser.id));

  revalidatePath('/dashboard');
  return { success: true, newXp, didLevelUp };
}
