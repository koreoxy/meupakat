'use client';
// src/lib/supabase/browser.ts
// Supabase client untuk Client Components
// Singleton pattern mencegah banyak instance saat hot-reload

import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Singleton Supabase browser client.
 * Gunakan di Client Components ('use client') untuk operasi:
 * - Auth state changes (onAuthStateChange)
 * - Real-time subscriptions
 * - Client-side data fetching
 *
 * @example
 * const supabase = getSupabaseBrowserClient();
 * const { data, error } = await supabase.from('users').select('*');
 */
export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
