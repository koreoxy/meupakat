// drizzle.config.ts
import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

// Drizzle Kit berjalan di luar Next.js, jadi kita harus me-load .env.local manual
config({ path: '.env.local' });

export default {
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Verbose output untuk debugging
  verbose: true,
  strict: true,
} satisfies Config;
