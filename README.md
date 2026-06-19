# 💬 Meupakat — Online English Speaking Sandbox

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?logo=nextdotjs)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?logo=supabase)](https://supabase.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-v0.45.2-c5f11a?logo=drizzle)](https://orm.drizzle.team/)
[![Groq API](https://img.shields.io/badge/Groq_API-Llama_3.3-orange)](https://groq.com/)
[![OpenAI TTS](https://img.shields.io/badge/OpenAI_TTS-tts--1-blue?logo=openai)](https://openai.com/)

**Meupakat** adalah platform interaktif (*Online Speaking Sandbox*) berbasis web yang dirancang khusus untuk membantu pengguna melatih kemampuan berbicara (*speaking*) bahasa Inggris secara mandiri. Menggunakan perpaduan kecerdasan buatan (AI) untuk percakapan dan evaluasi langsung, serta sistem gamifikasi terpadu untuk membangun kebiasaan belajar harian.

> [!NOTE]
> **Nama "Meupakat"** diambil dari bahasa Aceh yang berarti *berdiskusi, bermusyawarah, atau bernegosiasi untuk mencapai mufakat*. Nama ini sangat mewakili esensi utama aplikasi ini: melatih kemampuan berkomunikasi dan berdialog dalam bahasa Inggris untuk mencapai tujuan tertentu melalui berbagai misi skenario kehidupan nyata.

---

## 🌟 Fitur Utama

Aplikasi Meupakat dilengkapi dengan fitur-fitur modern untuk menunjang pembelajaran interaktif:

*   **🎙️ AI Voice Tutor**: Berlatih percakapan dua arah secara privat dengan AI Tutor yang responsif. Terintegrasi dengan fitur pengenalan suara (*Speech-to-Text*) dan keluaran suara natural (*Text-to-Speech*) menggunakan model **OpenAI TTS-1** (suara perempuan *Nova* atau *Shimmer*).
*   **🎯 Misi Skenario Kehidupan Nyata (Real Scenario Grid)**: Pengguna dapat memilih berbagai skenario dengan tingkat kesulitan berbeda (*Beginner*, *Intermediate*, *Advanced*), seperti memesan makanan di restoran, wawancara kerja, berkonsultasi dengan dokter, hingga berdiskusi bisnis. Setiap skenario memiliki tujuan kata kunci (*expected keywords*) dan arahan percakapan.
*   **⚡ Sistem XP, Level & Streak Harian**: Belajar terasa menyenangkan dengan gamifikasi! Dapatkan XP setelah menyelesaikan misi, naikkan level akun, dan pertahankan *Daily Streak* Anda. Progress harian ditampilkan dengan visual grafik sirkular dan kalender interaktif.
*   **📝 Evaluasi Instan Berbasis AI**: Setelah misi selesai, AI (didukung oleh **Llama 3.3 70B** via Groq) akan menilai performa percakapan Anda dalam aspek tata bahasa (*grammarScore* skala 0-15) dan kekayaan kosakata (*vocabularyScore* skala 0-15), disertai umpan balik deskriptif dalam bahasa Indonesia.
*   **📋 Tes Penempatan Tingkat Kemampuan (Placement Test)**: Bingung dengan level bahasa Inggris Anda? Ikuti tes penempatan cepat selama 5 menit untuk mengetahui apakah Anda berada di tingkat *Beginner*, *Intermediate*, atau *Advanced*.
*   **🎨 Desain Premium & Responsif (Refero Dark Mode)**: Antarmuka modern bertema gelap (*charcoal canvas* `#121314` dan *obsidian surfaces* `#1c1d1f`) yang nyaman di mata, dipercantik dengan aksen warna biru safir elektrik (`#3a86ff`) dan ungu. Responsif di perangkat desktop maupun mobile.
*   **📱 Progressive Web App (PWA)**: Aplikasi dapat diinstal langsung di layar utama ponsel atau desktop untuk akses instan layaknya aplikasi asli.

---

## 🛠️ Arsitektur Teknologi

Meupakat dibangun menggunakan teknologi modern yang efisien dan skalabel:

| Layer | Teknologi | Fungsi / Peran |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16.2 (App Router), React 19 | Kerangka kerja aplikasi utama, Server Components, dan perutean dinamis. |
| **Styling** | Tailwind CSS v4, Framer Motion | Desain antarmuka modern yang bersih, transisi antarmuka, dan efek animasi premium. |
| **Ikon & Efek**| Lucide React, Canvas Confetti | Kumpulan ikon minimalis dan animasi perayaan naik level/selesai misi. |
| **Database** | PostgreSQL (Supabase) | Menyimpan data pengguna, statistik XP, streak, serta progres latihan harian. |
| **ORM** | Drizzle ORM | Pemetaan skema basis data secara deklaratif dan migrasi skema yang aman. |
| **Autentikasi**| Supabase Auth & SSR SDK | Registrasi, login, manajemen sesi pengguna, dan pembatasan halaman aman (Middleware). |
| **Konektor AI** | OpenAI SDK, Groq Client | Penghubung ke model AI untuk memproses teks/percakapan dan evaluasi hasil belajar. |

---

## 🚀 Memulai (Panduan Instalasi Lokal)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek Meupakat di komputer lokal Anda:

### 📋 Prasyarat
Sebelum memulai, pastikan Anda telah memasang:
*   [Node.js](https://nodejs.org/) versi 18 atau lebih baru.
*   Akun [Supabase](https://supabase.com/) untuk database dan autentikasi.
*   API Key untuk salah satu penyedia AI (Groq API Key direkomendasikan karena digunakan sebagai mesin obrolan utama secara gratis/hemat).

### ⚙️ Langkah-Langkah Instalasi

1.  **Clone Repositori**
    ```bash
    git clone https://github.com/username/meupakat.git
    cd meupakat/meupakat-app
    ```

2.  **Instalasi Dependensi**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variables**
    Salin file `.env.example` menjadi `.env.local` di folder `meupakat-app`:
    ```bash
    cp .env.example .env.local
    ```
    Buka file `.env.local` dan isi nilai variabel berikut sesuai dengan akun Supabase dan API Key Anda:
    ```env
    # Supabase API (Dapatkan dari Settings -> API)
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

    # Database URL (Dapatkan dari Settings -> Database -> Connection string)
    DATABASE_URL=postgresql://postgres:password@db.your-project-id.supabase.co:6543/postgres

    # API Keys untuk Kecerdasan Buatan (AI)
    GROQ_API_KEY="gsk_your_groq_api_key"        # Digunakan untuk percakapan AI & evaluasi
    OPENAI_API_KEY="sk-proj-your_openai_key"    # Digunakan untuk Text-to-Speech (TTS)
    
    # Konfigurasi Opsional (Fallback AI)
    GEMINI_API_KEY=""
    GROQ_API_KEY=""

    # Konfigurasi Domain Aplikasi
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

4.  **Sinkronisasi Skema Database (Drizzle Kit)**
    Jalankan perintah berikut untuk membuat tabel yang diperlukan secara otomatis di database Supabase Anda:
    ```bash
    npx drizzle-kit push
    ```

5.  **Jalankan Server Pengembangan**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) pada peramban web Anda untuk melihat aplikasi yang berjalan secara lokal.

---

## 📂 Struktur Folder Proyek

```text
meupakat-app/
├── public/                 # Aset statis (gambar maskot, ikon PWA, manifes)
├── src/
│   ├── app/                # Perutean Next.js (App Router) & Server Actions
│   │   ├── actions/        # Server Actions untuk autentikasi dan mutasi data
│   │   ├── api/            # API Endpoints (Chat, Evaluasi, TTS, Auth)
│   │   ├── dashboard/      # Halaman utama aplikasi (Misi, Profil, Latihan)
│   │   ├── login/          # Halaman Masuk
│   │   ├── register/       # Halaman Daftar
│   │   ├── globals.css     # CSS Global (Variables & Custom Utilities)
│   │   └── layout.tsx      # Tata letak dasar aplikasi
│   ├── components/         # Komponen React yang Dapat Digunakan Kembali
│   │   ├── features/       # Komponen spesifik fitur (ConversationPlayer, StreakCalendar)
│   │   └── ui/             # Komponen UI Dasar (Button, Card, Input)
│   ├── db/                 # Konfigurasi Database (Koneksi Drizzle & Skema Tabel)
│   ├── hooks/              # Custom React Hooks (Theme, Store, PWA)
│   ├── lib/                # Konfigurasi Utilitas & Kumpulan Misi/Skenario Percakapan
│   └── types/              # Definisi Tipe Data TypeScript
├── drizzle.config.ts       # Konfigurasi Drizzle Kit
├── next.config.ts          # Konfigurasi Next.js
└── package.json            # Daftar dependensi dan skrip proyek
```

---

## 📜 Lisensi & Kontribusi

Proyek ini dibuat untuk tujuan pembelajaran dan pengembangan diri. Kontribusi dalam bentuk perbaikan bug, penambahan fitur skenario baru, atau optimasi kinerja sangat diapresiasi! Silakan buat *pull request* atau buat *issue* baru di repositori ini.

Aplikasi ini dilisensikan di bawah **MIT License**.
