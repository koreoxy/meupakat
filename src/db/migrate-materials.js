const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set!");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function run() {
  try {
    console.log("Starting database migration for Speaking Materials...");

    // 1. Create Enum speaking_material_type
    console.log("Creating enum 'speaking_material_type' if not exists...");
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'speaking_material_type') THEN
          CREATE TYPE speaking_material_type AS ENUM ('quote', 'movie_script', 'song_lyrics');
        END IF;
      END$$;
    `;

    // 2. Create Table speaking_materials
    console.log("Creating table 'speaking_materials' if not exists...");
    await sql`
      CREATE TABLE IF NOT EXISTS speaking_materials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type speaking_material_type NOT NULL,
        content TEXT NOT NULL,
        translation TEXT,
        source TEXT NOT NULL,
        difficulty user_level NOT NULL DEFAULT 'beginner',
        xp_reward INTEGER NOT NULL DEFAULT 15,
        audio_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    console.log("Successfully ran speaking_materials migration.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sql.end();
  }
}

run();
