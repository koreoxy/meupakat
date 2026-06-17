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
    console.log("Checking if column 'next_daily_target_minutes' exists in 'users'...");
    const check = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='next_daily_target_minutes';
    `;
    
    if (check.length === 0) {
      console.log("Adding column 'next_daily_target_minutes' to 'users' table...");
      await sql`
        ALTER TABLE users 
        ADD COLUMN next_daily_target_minutes integer NOT NULL DEFAULT 10;
      `;
      console.log("Successfully added 'next_daily_target_minutes' column.");
    } else {
      console.log("Column 'next_daily_target_minutes' already exists.");
    }
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sql.end();
  }
}

run();
