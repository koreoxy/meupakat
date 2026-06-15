// src/lib/supabase/server.ts
// Supabase client untuk Server Components, Server Actions, dan Route Handlers
// Menggunakan @supabase/ssr untuk cookie-based session management

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Buat Supabase client untuk digunakan di:
 * - Server Components
 * - Server Actions (gunakan `await createSupabaseServerClient()`)
 * - Route Handlers
 *
 * @example
 * // Di Server Component:
 * const supabase = await createSupabaseServerClient();
 * const { data: { user } } = await supabase.auth.getUser();
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll mungkin gagal di Server Components (read-only)
            // Aman untuk diabaikan karena middleware menangani refresh session
          }
        },
      },
    }
  );
}

/**
 * Buat Supabase Admin client menggunakan Service Role Key.
 * Hanya gunakan di server-side. JANGAN kirim ke client.
 * Bypass Row Level Security — gunakan dengan hati-hati!
 */
export async function createSupabaseAdminClient() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
