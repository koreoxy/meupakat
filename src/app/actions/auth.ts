'use server';
// src/app/actions/auth.ts
// Server Actions untuk autentikasi via Supabase Auth

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { users, streaks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { UserLevel } from '@/types';

// ─── Register ─────────────────────────────────────────────────────────────────

export interface RegisterResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

/**
 * Daftarkan user baru dengan email + password.
 * Setelah berhasil, buat row di tabel `users` dan `streaks`.
 */
export async function registerWithEmail(
  fullName: string,
  email: string,
  password: string,
  level: UserLevel
): Promise<RegisterResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Jika email konfirmasi dibutuhkan (Supabase default)
  if (!data.user) {
    return { success: true, requiresEmailConfirmation: true };
  }

  // Buat profil user di database
  await createUserProfile(data.user.id, fullName, email, level);

  revalidatePath('/dashboard');
  return { success: true };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * Login dengan email + password.
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<LoginResult> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export interface OAuthResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Mulai alur Google OAuth. Return URL untuk redirect.
 */
export async function loginWithGoogle(): Promise<OAuthResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });

  if (error || !data.url) {
    return { success: false, error: error?.message ?? 'Failed to initiate Google login' };
  }

  return { success: true, url: data.url };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/');
}

// ─── Get Current User ────────────────────────────────────────────────────────

/**
 * Ambil user yang sedang login dari Supabase Auth.
 * Gunakan ini di Server Components untuk proteksi halaman.
 */
export async function getCurrentAuthUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Buat profil user dan streak record setelah registrasi.
 * Dipanggil setelah auth.signUp berhasil.
 */
export async function createUserProfile(
  authUserId: string,
  fullName: string,
  email: string,
  level: UserLevel
) {
  // Cek apakah sudah ada (hindari duplicate dari OAuth trigger)
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, authUserId))
    .limit(1);

  if (existing.length > 0) return;

  // Insert user profile
  await db.insert(users).values({
    id: authUserId,
    fullName,
    email,
    currentLevel: level,
    currentXp: 0,
    dailyTargetMinutes: 10,
  });

  // Insert streak record
  await db.insert(streaks).values({
    userId: authUserId,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  });
}
