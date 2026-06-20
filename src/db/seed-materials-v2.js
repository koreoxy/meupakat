const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL is not set!"); process.exit(1); }

const sql = postgres(connectionString, { prepare: false });

const NEW_MATERIALS = [
  // ─── 10 NEW QUOTES ────────────────────────────────────────────────
  { type: 'quote', content: "The future belongs to those who believe in the beauty of their dreams.", translation: "Masa depan milik mereka yang percaya akan keindahan impian mereka.", source: "Eleanor Roosevelt", difficulty: "beginner", xp_reward: 15 },
  { type: 'quote', content: "It does not matter how slowly you go as long as you do not stop.", translation: "Tidak masalah seberapa lambat Anda berjalan, asalkan Anda tidak berhenti.", source: "Confucius", difficulty: "beginner", xp_reward: 15 },
  { type: 'quote', content: "Success is not final, failure is not fatal — it is the courage to continue that counts.", translation: "Kesuksesan bukanlah akhir, kegagalan bukanlah malapetaka — keberanian untuk teruslah yang penting.", source: "Winston Churchill", difficulty: "intermediate", xp_reward: 20 },
  { type: 'quote', content: "Believe you can and you're halfway there.", translation: "Percayalah bahwa Anda bisa dan Anda sudah setengah jalan.", source: "Theodore Roosevelt", difficulty: "beginner", xp_reward: 15 },
  { type: 'quote', content: "Life is what happens when you're busy making other plans.", translation: "Hidup adalah apa yang terjadi saat Anda sibuk membuat rencana lain.", source: "John Lennon", difficulty: "intermediate", xp_reward: 20 },
  { type: 'quote', content: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", translation: "Sebarkan cinta di mana pun Anda pergi. Jangan biarkan siapa pun datang kepada Anda tanpa pergi lebih bahagia.", source: "Mother Teresa", difficulty: "intermediate", xp_reward: 20 },
  { type: 'quote', content: "When you reach the end of your rope, tie a knot in it and hang on.", translation: "Ketika Anda mencapai ujung tali Anda, ikat simpul di sana dan bertahanlah.", source: "Franklin D. Roosevelt", difficulty: "advanced", xp_reward: 25 },
  { type: 'quote', content: "Always remember that you are absolutely unique. Just like everyone else.", translation: "Selalu ingat bahwa Anda benar-benar unik. Sama seperti orang lain.", source: "Margaret Mead", difficulty: "intermediate", xp_reward: 20 },
  { type: 'quote', content: "You will face many defeats in life, but never let yourself be defeated.", translation: "Anda akan menghadapi banyak kekalahan dalam hidup, tetapi jangan pernah membiarkan diri Anda dikalahkan.", source: "Maya Angelou", difficulty: "advanced", xp_reward: 25 },
  { type: 'quote', content: "In the end, it's not the years in your life that count. It's the life in your years.", translation: "Pada akhirnya, bukan berapa tahun dalam hidup Anda yang penting. Tapi seberapa hidup dalam tahun-tahun Anda.", source: "Abraham Lincoln", difficulty: "advanced", xp_reward: 25 },

  // ─── 10 NEW MOVIE SCRIPTS ─────────────────────────────────────────
  { type: 'movie_script', content: "To infinity and beyond! Reach for the stars and never look back.", translation: "Menuju tak terhingga dan melampaui! Raih bintang dan jangan pernah menoleh ke belakang.", source: "Buzz Lightyear (Toy Story, 1995)", difficulty: "beginner", xp_reward: 15 },
  { type: 'movie_script', content: "You can't handle the truth! You live on a wall that I protect.", translation: "Kamu tidak bisa menerima kebenaran! Kamu hidup di balik tembok yang aku jaga.", source: "Col. Jessup (A Few Good Men, 1992)", difficulty: "intermediate", xp_reward: 20 },
  { type: 'movie_script', content: "Life is like a box of chocolates. You never know what you're gonna get.", translation: "Hidup itu seperti kotak cokelat. Kamu tidak pernah tahu apa yang akan kamu dapatkan.", source: "Forrest Gump (Forrest Gump, 1994)", difficulty: "beginner", xp_reward: 15 },
  { type: 'movie_script', content: "You is kind, you is smart, you is important. Don't let anyone tell you otherwise.", translation: "Kamu baik, kamu cerdas, kamu penting. Jangan biarkan siapa pun berkata sebaliknya.", source: "Aibileen Clark (The Help, 2011)", difficulty: "intermediate", xp_reward: 20 },
  { type: 'movie_script', content: "My mama always said life was like a box of chocolates — full of surprises.", translation: "Mama saya selalu bilang hidup itu seperti kotak cokelat — penuh kejutan.", source: "Forrest Gump (Forrest Gump, 1994)", difficulty: "beginner", xp_reward: 15 },
  { type: 'movie_script', content: "Just keep swimming. Just keep swimming. What do we do? We swim.", translation: "Terus berenang. Terus berenang. Apa yang kita lakukan? Kita berenang.", source: "Dory (Finding Nemo, 2003)", difficulty: "beginner", xp_reward: 15 },
  { type: 'movie_script', content: "Why do we fall, sir? So that we can learn to pick ourselves up.", translation: "Mengapa kita jatuh, Tuan? Agar kita belajar untuk bangkit kembali.", source: "Alfred Pennyworth (Batman Begins, 2005)", difficulty: "intermediate", xp_reward: 20 },
  { type: 'movie_script', content: "You either die a hero or live long enough to see yourself become the villain.", translation: "Kamu mati sebagai pahlawan atau hidup cukup lama hingga menjadi penjahat.", source: "Harvey Dent (The Dark Knight, 2008)", difficulty: "advanced", xp_reward: 25 },
  { type: 'movie_script', content: "With great power comes great responsibility. Never forget that.", translation: "Dengan kekuatan besar datang tanggung jawab besar. Jangan pernah lupakan itu.", source: "Uncle Ben (Spider-Man, 2002)", difficulty: "intermediate", xp_reward: 20 },
  { type: 'movie_script', content: "I am Groot. We are Groot. We stand together, no matter what.", translation: "Saya Groot. Kami adalah Groot. Kami berdiri bersama, apapun yang terjadi.", source: "Groot (Guardians of the Galaxy, 2014)", difficulty: "beginner", xp_reward: 15 },

  // ─── 10 NEW SONG LYRICS ───────────────────────────────────────────
  { type: 'song_lyrics', content: "Don't stop believin', hold on to the feelin'. Streetlights, people.", translation: "Jangan berhenti percaya, pegang perasaan itu. Lampu jalan, orang-orang.", source: "Journey (Don't Stop Believin')", difficulty: "intermediate", xp_reward: 20 },
  { type: 'song_lyrics', content: "We will, we will rock you. Buddy, you're a boy, make a big noise.", translation: "Kami akan, kami akan menggoyang kamu. Sobat, kamu masih bocah, buat keributan besar.", source: "Queen (We Will Rock You)", difficulty: "beginner", xp_reward: 15 },
  { type: 'song_lyrics', content: "Imagine all the people living life in peace. You may say I'm a dreamer.", translation: "Bayangkan semua orang menjalani hidup dengan damai. Anda mungkin menganggap saya pemimpi.", source: "John Lennon (Imagine)", difficulty: "intermediate", xp_reward: 20 },
  { type: 'song_lyrics', content: "I will always love you. I will always love you. My darling you.", translation: "Aku akan selalu mencintaimu. Aku akan selalu mencintaimu. Sayangku, kamu.", source: "Whitney Houston (I Will Always Love You)", difficulty: "beginner", xp_reward: 15 },
  { type: 'song_lyrics', content: "Shape of you, I'm in love with your body. Every day discovering something brand new.", translation: "Bentuk dirimu, aku jatuh cinta dengan tubuhmu. Setiap hari menemukan sesuatu yang baru.", source: "Ed Sheeran (Shape of You)", difficulty: "intermediate", xp_reward: 20 },
  { type: 'song_lyrics', content: "What doesn't kill you makes you stronger, stand a little taller.", translation: "Apa yang tidak membunuhmu membuatmu lebih kuat, berdiri sedikit lebih tegak.", source: "Kelly Clarkson (Stronger)", difficulty: "intermediate", xp_reward: 20 },
  { type: 'song_lyrics', content: "Rolling in the deep. We could have had it all, rolling in the deep.", translation: "Bergulung di kedalaman. Kita bisa mendapatkan segalanya, bergulung di kedalaman.", source: "Adele (Rolling in the Deep)", difficulty: "intermediate", xp_reward: 20 },
  { type: 'song_lyrics', content: "Shallow, ha-ah-ah. I'm off the deep end, watch as I dive in.", translation: "Dangkal, ha-ah-ah. Aku di ujung yang dalam, saksikan aku menyelam.", source: "Lady Gaga & Bradley Cooper (Shallow)", difficulty: "advanced", xp_reward: 25 },
  { type: 'song_lyrics', content: "Counting stars, lately I've been losing sleep. Dreaming about the things that we could be.", translation: "Menghitung bintang, belakangan ini aku kurang tidur. Bermimpi tentang hal-hal yang bisa kita capai.", source: "OneRepublic (Counting Stars)", difficulty: "advanced", xp_reward: 25 },
  { type: 'song_lyrics', content: "Happy. Clap along if you feel like a room without a roof.", translation: "Bahagia. Bertepuk tanganlah jika kamu merasa seperti ruangan tanpa atap.", source: "Pharrell Williams (Happy)", difficulty: "beginner", xp_reward: 15 },
];

async function seedMore() {
  try {
    console.log(`Inserting ${NEW_MATERIALS.length} new speaking materials...`);
    for (const item of NEW_MATERIALS) {
      await sql`
        INSERT INTO speaking_materials (type, content, translation, source, difficulty, xp_reward)
        VALUES (${item.type}, ${item.content}, ${item.translation}, ${item.source}, ${item.difficulty}, ${item.xp_reward})
      `;
      console.log(`✓ ${item.type}: "${item.content.substring(0, 40)}..."`);
    }
    console.log("Done! All new materials inserted.");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await sql.end();
  }
}

seedMore();
