const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set!");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

const MATERIALS = [
  // ─── QUOTES ────────────────────────────────────────────────────────────────
  {
    type: 'quote',
    content: "The only way to do great work is to love what you do.",
    translation: "Satu-satunya cara untuk melakukan pekerjaan luar biasa adalah dengan mencintai apa yang Anda lakukan.",
    source: "Steve Jobs",
    difficulty: "beginner",
    xp_reward: 15
  },
  {
    type: 'quote',
    content: "In the middle of difficulty lies opportunity.",
    translation: "Di tengah kesulitan terdapat kesempatan.",
    source: "Albert Einstein",
    difficulty: "intermediate",
    xp_reward: 20
  },
  {
    type: 'quote',
    content: "The only limit to our realization of tomorrow will be our doubts of today.",
    translation: "Satu-satunya batasan untuk pencapaian kita hari esok adalah keraguan kita hari ini.",
    source: "Franklin D. Roosevelt",
    difficulty: "advanced",
    xp_reward: 25
  },
  {
    type: 'quote',
    content: "Be yourself; everyone else is already taken.",
    translation: "Jadilah dirimu sendiri; orang lain sudah ada yang memiliki.",
    source: "Oscar Wilde",
    difficulty: "beginner",
    xp_reward: 15
  },
  {
    type: 'quote',
    content: "Do what you can, with what you have, where you are.",
    translation: "Lakukan apa yang Anda bisa, dengan apa yang Anda miliki, di mana Anda berada.",
    source: "Theodore Roosevelt",
    difficulty: "intermediate",
    xp_reward: 20
  },

  // ─── MOVIE SCRIPTS ────────────────────────────────────────────────────────
  {
    type: 'movie_script',
    content: "Why so serious? Let's put a smile on that face!",
    translation: "Mengapa begitu serius? Mari taruh senyuman di wajah itu!",
    source: "The Joker (The Dark Knight, 2008)",
    difficulty: "beginner",
    xp_reward: 15
  },
  {
    type: 'movie_script',
    content: "May the Force be with you. It's an energy field created by all living things.",
    translation: "Semoga Force bersamamu. Ini adalah medan energi yang diciptakan oleh semua makhluk hidup.",
    source: "Obi-Wan Kenobi (Star Wars, 1977)",
    difficulty: "intermediate",
    xp_reward: 20
  },
  {
    type: 'movie_script',
    content: "Here's looking at you, kid. We will always have Paris.",
    translation: "Ini untuk melihatmu, Nak. Kita akan selalu memiliki Paris.",
    source: "Rick Blaine (Casablanca, 1942)",
    difficulty: "advanced",
    xp_reward: 25
  },
  {
    type: 'movie_script',
    content: "I'll be back. Keep quiet and stay here.",
    translation: "Aku akan kembali. Diamlah dan tetap di sini.",
    source: "The Terminator (The Terminator, 1984)",
    difficulty: "beginner",
    xp_reward: 15
  },
  {
    type: 'movie_script',
    content: "Carpe diem. Seize the day, boys. Make your lives extraordinary.",
    translation: "Carpe diem. Rebutlah hari ini, anak-anak. Jadikan hidup kalian luar biasa.",
    source: "John Keating (Dead Poets Society, 1989)",
    difficulty: "intermediate",
    xp_reward: 20
  },

  // ─── SONG LYRICS ─────────────────────────────────────────────────────────
  {
    type: 'song_lyrics',
    content: "Yesterday, all my troubles seemed so far away. Now it looks as though they're here to stay.",
    translation: "Kemarin, semua masalahku sepertinya begitu jauh. Kini seolah mereka akan menetap di sini.",
    source: "The Beatles (Yesterday)",
    difficulty: "beginner",
    xp_reward: 15
  },
  {
    type: 'song_lyrics',
    content: "You belong with me. If you could see that I'm the one who understands you.",
    translation: "Kamu ditakdirkan bersamaku. Jika kamu bisa melihat bahwa akulah yang memahamimu.",
    source: "Taylor Swift (You Belong With Me)",
    difficulty: "intermediate",
    xp_reward: 20
  },
  {
    type: 'song_lyrics',
    content: "Is this the real life? Is this just fantasy? Caught in a landside, no escape from reality.",
    translation: "Apakah ini kehidupan nyata? Apakah ini hanya fantasi? Terjebak dalam tanah longsor, tak ada jalan keluar dari kenyataan.",
    source: "Queen (Bohemian Rhapsody)",
    difficulty: "advanced",
    xp_reward: 25
  },
  {
    type: 'song_lyrics',
    content: "Hello from the other side. I must have called a thousand times.",
    translation: "Halo dari sisi yang lain. Aku pasti sudah menelepon seribu kali.",
    source: "Adele (Hello)",
    difficulty: "beginner",
    xp_reward: 15
  },
  {
    type: 'song_lyrics',
    content: "It's a beautiful day. Don't let it get away. You're on the road but you've got no destination.",
    translation: "Ini hari yang indah. Jangan biarkan itu pergi berlalu. Anda sedang dalam perjalanan namun tak punya tujuan.",
    source: "U2 (Beautiful Day)",
    difficulty: "intermediate",
    xp_reward: 20
  }
];

async function seed() {
  try {
    console.log("Starting seeding speaking_materials...");

    // Clear existing data to avoid duplicates on re-run
    console.log("Clearing existing speaking materials...");
    await sql`TRUNCATE TABLE speaking_materials CASCADE;`;

    for (const item of MATERIALS) {
      console.log(`Inserting ${item.type}: "${item.content.substring(0, 30)}..."`);
      await sql`
        INSERT INTO speaking_materials (type, content, translation, source, difficulty, xp_reward)
        VALUES (${item.type}, ${item.content}, ${item.translation}, ${item.source}, ${item.difficulty}, ${item.xp_reward})
      `;
    }

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await sql.end();
  }
}

seed();
