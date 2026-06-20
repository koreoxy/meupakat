'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'id' | 'en';

const translations = {
  id: {
    // Nav
    nav_home: 'Beranda',
    nav_practice: 'Latihan',
    nav_materials: 'Kartu Speaking',
    nav_stats: 'Statistik',
    nav_leaderboard: 'Papan Peringkat',
    nav_vocabulary: 'Kamus & Kosakata',
    nav_profile: 'Profil',

    // Dashboard Home
    db_title: 'Selamat Datang Kembali',
    db_recommendations: 'Rekomendasi Pintar',
    db_recommendations_desc: 'Saran latihan berdasarkan tingkat kemahiran Anda',
    db_daily_reward: 'Hadiah Harian',
    db_daily_reward_claim: 'Klaim XP Harian',
    db_daily_reward_claimed: 'XP Harian Telah Diklaim',
    db_weekly_xp: 'XP Mingguan Anda',
    db_today_target: 'Target Hari Ini',
    db_minutes: 'menit',

    // Practice
    pr_todays_topic: 'Topik Hari Ini',
    pr_todays_topic_desc: 'Tantangan berbicara harian yang disesuaikan untuk Anda',
    pr_key_vocab: 'Kosakata Kunci',
    pr_start_button: 'Mulai Latihan',
    pr_choose_scenario: 'Pilih Skenario Percakapan',

    // Stats
    st_title: 'Statistik Belajar',
    st_subtitle: 'Perkembangan belajar bahasa Inggris Anda',
    st_total_xp: 'Total XP',
    st_total_minutes: 'Total Menit',
    st_saved_words: 'Kosakata Disimpan',
    st_best_streak: 'Streak Terbaik',
    st_minutes_spoken: 'Menit Berbicara',
    st_streak_overview: 'Ikhtisar Streak',
    st_week_summary: 'Ringkasan Minggu Ini',

    // Leaderboard
    ld_title: 'Papan Peringkat Mingguan',
    ld_subtitle: 'Lihat peringkat Anda dibandingkan pembelajar lain',
    ld_promoted: 'Zona Promosi',
    ld_demoted: 'Zona Degradasi',
    ld_weekly_xp: 'XP Mingguan',

    // Vocabulary
    vc_title: 'Kosakata Saya',
    vc_subtitle: 'kata disimpan · Klik kartu untuk melihat arti',
    vc_search: 'Cari kata atau definisi...',
    vc_empty: 'Belum ada kosakata disimpan',
    vc_empty_desc: 'Klik kata apa saja dalam percakapan AI untuk melihat arti dan menyimpannya di sini!',
    vc_remove: 'Hapus',
    vc_tap_reveal: 'Sentuh untuk melihat arti',

    // Profile
    pf_title: 'Profil',
    pf_xp: 'Poin Pengalaman',
    pf_to_next: 'XP ke peringkat berikutnya',
    pf_daily_target: 'Target Harian',
    pf_daily_target_desc: 'Berapa menit target latihan berbicara yang ingin Anda capai per hari?',
    pf_save_target: 'Simpan Target',
    pf_sign_out: 'Keluar',
    pf_level_journey: 'Perjalanan Peringkat',
    pf_lang_settings: 'Pengaturan Bahasa',
    pf_lang_desc: 'Pilih bahasa tampilan untuk aplikasi',
  },
  en: {
    // Nav
    nav_home: 'Home',
    nav_practice: 'Practice',
    nav_materials: 'Speaking Cards',
    nav_stats: 'Stats',
    nav_leaderboard: 'Leaderboard',
    nav_vocabulary: 'Dictionary & Vocab',
    nav_profile: 'Profile',

    // Dashboard Home
    db_title: 'Welcome Back',
    db_recommendations: 'Smart Recommendations',
    db_recommendations_desc: 'Practice suggestions tailored to your proficiency',
    db_daily_reward: 'Daily Login Reward',
    db_daily_reward_claim: 'Claim Daily XP',
    db_daily_reward_claimed: 'Daily XP Claimed',
    db_weekly_xp: 'Your Weekly XP',
    db_today_target: "Today's Target",
    db_minutes: 'minutes',

    // Practice
    pr_todays_topic: "Today's Topic",
    pr_todays_topic_desc: 'Daily speaking challenge tailored for you',
    pr_key_vocab: 'Key Vocabulary',
    pr_start_button: 'Start Practice',
    pr_choose_scenario: 'Choose a Conversation Scenario',

    // Stats
    st_title: 'Learning Stats',
    st_subtitle: 'Your English learning journey at a glance',
    st_total_xp: 'Total XP',
    st_total_minutes: 'Total Minutes',
    st_saved_words: 'Saved Words',
    st_best_streak: 'Best Streak',
    st_minutes_spoken: 'Minutes Spoken',
    st_streak_overview: 'Streak Overview',
    st_week_summary: 'This Week Summary',

    // Leaderboard
    ld_title: 'Weekly Leaderboard',
    ld_subtitle: 'See how you rank against other learners',
    ld_promoted: 'Promotion Zone',
    ld_demoted: 'Demotion Zone',
    ld_weekly_xp: 'Weekly XP',

    // Vocabulary
    vc_title: 'My Vocabulary',
    vc_subtitle: 'words saved · Click any card to see definition',
    vc_search: 'Search words or definitions...',
    vc_empty: 'No vocabulary saved yet',
    vc_empty_desc: 'Click any word in a conversation to look it up and save it here!',
    vc_remove: 'Remove',
    vc_tap_reveal: 'Tap to reveal',

    // Profile
    pf_title: 'Profile',
    pf_xp: 'Experience Points',
    pf_to_next: 'XP to next rank',
    pf_daily_target: 'Daily Target',
    pf_daily_target_desc: 'How many minutes of speaking practice do you want to target per day?',
    pf_save_target: 'Save Target',
    pf_sign_out: 'Sign Out',
    pf_level_journey: 'Rank Journey',
    pf_lang_settings: 'Language Settings',
    pf_lang_desc: 'Choose display language for the application',
  }
};

export type TranslationKeys = keyof typeof translations.id;

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextProps | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id'); // Default to Indonesian ('id')

  useEffect(() => {
    const saved = localStorage.getItem('app-language') as Language;
    if (saved === 'id' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: TranslationKeys): string => {
    return translations[language][key] || translations['id'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
