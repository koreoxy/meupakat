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
    console.log("Checking if column 'is_cards_mission_completed' exists in 'daily_progress'...");
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='daily_progress' AND column_name='is_cards_mission_completed';
    `;
    
    if (checkColumn.length === 0) {
      console.log("Adding column 'is_cards_mission_completed' to 'daily_progress' table...");
      await sql`
        ALTER TABLE daily_progress 
        ADD COLUMN is_cards_mission_completed boolean NOT NULL DEFAULT false;
      `;
      console.log("Successfully added 'is_cards_mission_completed' column.");
    } else {
      console.log("Column 'is_cards_mission_completed' already exists.");
    }

    console.log("Creating table 'user_card_practices' if not exists...");
    await sql`
      CREATE TABLE IF NOT EXISTS user_card_practices (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        material_id uuid NOT NULL REFERENCES speaking_materials(id) ON DELETE CASCADE,
        date text NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `;
    console.log("Successfully processed table 'user_card_practices'.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sql.end();
  }
}

run();
