// src/db/index.ts
// Drizzle ORM client — connects to Supabase PostgreSQL
// Menggunakan `postgres` driver (Transaction mode, port 6543 untuk Supabase pooler)

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Singleton connection. Gunakan DATABASE_URL dari .env.local.
 *
 * Catatan penting untuk Supabase:
 * - Gunakan port 6543 (Transaction mode / PgBouncer) untuk serverless
 * - Jangan gunakan port 5432 di lingkungan edge/serverless
 */
function createDbClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Isi DATABASE_URL di .env.local terlebih dahulu.'
    );
  }

  const client = postgres(connectionString, {
    // Untuk Supabase Transaction mode (PgBouncer), prepare harus false
    prepare: false,
    max: 1, // Minimal connection untuk serverless
  });

  return drizzle(client, { schema });
}

// Global singleton (mencegah hot-reload membuat banyak koneksi di dev)
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDbClient> | undefined;
};

export const db = globalForDb.db ?? createDbClient();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

export { schema };
