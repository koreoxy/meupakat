'use client';
// src/app/dashboard/practice/materials/page.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/hooks/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/ui/Toast';
import { getSpeakingMaterials, type SpeakingMaterialCategory } from '@/app/actions/materials';
import SpeakingCard from '@/components/features/SpeakingCard';
import { getLevelInfoByXp } from '@/lib/utils/xp';
import { format } from 'date-fns';

interface Material {
  id: string;
  type: 'quote' | 'movie_script' | 'song_lyrics';
  content: string;
  translation: string | null;
  source: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
}

const STORAGE_KEY_PREFIX = 'meupakat_practiced_';

function getTodayKey() {
  return STORAGE_KEY_PREFIX + format(new Date(), 'yyyy-MM-dd');
}

function loadPracticedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(getTodayKey());
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function savePracticedId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = getTodayKey();
    const raw = localStorage.getItem(key);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(key, JSON.stringify(ids));
    }
  } catch {
    // silently fail
  }
}

export default function SpeakingMaterialsPage() {
  const { user, streak, todayProgress, completeSpeakingCard } = useAppStore();
  const { language } = useTranslation();
  const { showToast } = useToast();

  const [activeCategory, setActiveCategory] = useState<SpeakingMaterialCategory>('quote');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [practicedIds, setPracticedIds] = useState<Set<string>>(new Set());

  // Load practiced IDs from localStorage on mount
  useEffect(() => {
    setPracticedIds(loadPracticedIds());
  }, []);

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSpeakingMaterials(activeCategory);
      setMaterials(data.map((d) => ({
        id: d.id,
        type: d.type as Material['type'],
        content: d.content,
        translation: d.translation,
        source: d.source,
        difficulty: d.difficulty as Material['difficulty'],
        xpReward: d.xpReward,
      })));
    } catch {
      showToast(language === 'id' ? 'Gagal mengambil data materi.' : 'Failed to load materials.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, showToast, language]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  const handleSuccessSubmit = async (xpGained: number, materialId: string) => {
    // Mark as practiced in localStorage and state
    savePracticedId(materialId);
    setPracticedIds(prev => new Set([...prev, materialId]));

    // Persist to server database
    await completeSpeakingCard(materialId);

    showToast(
      language === 'id'
        ? `🎉 Latihan berhasil! +${xpGained} XP ditambahkan!`
        : `🎉 Practice submitted! +${xpGained} XP added!`,
      'success', 4000
    );
  };

  const levelInfo = user ? getLevelInfoByXp(user.currentXp) : null;
  const streakCount = streak?.currentStreak ?? 0;
  const minutesProgress = todayProgress?.minutesSpoken ?? 0;
  const targetMinutes = user?.dailyTargetMinutes ?? 10;

  const CATEGORIES: { key: SpeakingMaterialCategory; emoji: string; labelId: string; labelEn: string }[] = [
    { key: 'quote',       emoji: '💬', labelId: 'Kutipan', labelEn: 'Quotes' },
    { key: 'movie_script', emoji: '🎬', labelId: 'Film',    labelEn: 'Movie' },
    { key: 'song_lyrics', emoji: '🎵', labelId: 'Lirik',   labelEn: 'Lyrics' },
  ];

  const completedCount = materials.filter(m => practicedIds.has(m.id)).length;

  return (
    <>
      {/* ════ DESKTOP LAYOUT (lg+) ════ */}
      <div className="hidden lg:block px-8 pt-6 pb-10 max-w-6xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link href="/dashboard/practice" className="text-[12px] text-[var(--color-primary)] font-semibold hover:underline flex items-center gap-1 mb-2">
              ← {language === 'id' ? 'Kembali ke Latihan' : 'Back to Practice'}
            </Link>
            <h1 className="font-display-md text-[var(--color-ink)] flex items-center gap-2">
              🃏 {language === 'id' ? 'Kartu Speaking' : 'Speaking Cards'}
            </h1>
            <p className="text-[13px] text-[var(--color-ink-muted)] mt-1">
              {language === 'id'
                ? 'Tingkatkan kelancaran berbicara dari Kutipan, Naskah Film, atau Lirik Lagu.'
                : 'Improve your speaking fluency with quotes, movie lines, or song lyrics.'}
            </p>
          </div>

          {/* Gamification stats */}
          <div className="flex gap-3 bg-[var(--color-surface-sidebar)] p-3 rounded-[var(--radius-lg)] border border-[var(--color-hairline)] shrink-0">
            <div className="text-center px-3">
              <span className="text-xl">🔥</span>
              <p className="text-[14px] font-black text-[var(--color-ink)] leading-tight mt-0.5">{streakCount} {language === 'id' ? 'Hari' : 'Days'}</p>
              <p className="text-[9px] text-[var(--color-ink-muted)] font-semibold uppercase tracking-wider">Streak</p>
            </div>
            <div className="w-px bg-[var(--color-hairline)]" />
            <div className="text-center px-3">
              <span className="text-xl">⏱️</span>
              <p className="text-[14px] font-black text-[var(--color-ink)] leading-tight mt-0.5">{minutesProgress}/{targetMinutes}m</p>
              <p className="text-[9px] text-[var(--color-ink-muted)] font-semibold uppercase tracking-wider">{language === 'id' ? 'Latihan' : 'Spoken'}</p>
            </div>
            <div className="w-px bg-[var(--color-hairline)]" />
            <div className="text-center px-3">
              <span className="text-xl">{levelInfo?.emoji || '⚙️'}</span>
              <p className="text-[14px] font-black text-[var(--color-ink)] leading-tight mt-0.5 truncate max-w-[80px]">{levelInfo?.label || 'Iron 1'}</p>
              <p className="text-[9px] text-[var(--color-ink-muted)] font-semibold uppercase tracking-wider">Rank</p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {CATEGORIES.map(({ key, emoji, labelId, labelEn }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex flex-col items-center p-4 rounded-[var(--radius-lg)] border transition-all duration-200 ${
                activeCategory === key
                  ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-ink)] shadow-[0_0_15px_rgba(58,134,255,0.15)]'
                  : 'bg-[var(--color-surface-card)] border-[var(--color-hairline)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-muted)]'
              }`}
            >
              <span className="text-2xl mb-1">{emoji}</span>
              <span className="text-[13px] font-bold">{language === 'id' ? labelId : labelEn}</span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        {!isLoading && materials.length > 0 && (
          <div className="mb-6 flex items-center gap-3 bg-[var(--color-surface-card)] border border-[var(--color-hairline)] rounded-[var(--radius-lg)] px-4 py-3">
            <span className="text-sm">📋</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-[var(--color-ink-secondary)]">
                  {language === 'id' ? 'Progress Hari Ini' : "Today's Progress"}
                </span>
                <span className="text-[11px] font-black text-[var(--color-primary)]">{completedCount}/{materials.length}</span>
              </div>
              <div className="h-1.5 bg-[var(--color-surface-active)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                  style={{ width: `${materials.length ? (completedCount / materials.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            {completedCount === materials.length && completedCount > 0 && (
              <span className="text-[11px] font-bold text-emerald-500">✅ {language === 'id' ? 'Semua selesai!' : 'All done!'}</span>
            )}
          </div>
        )}

        {/* Card Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
            <p className="text-[12px] text-[var(--color-ink-muted)]">{language === 'id' ? 'Memuat kartu...' : 'Loading cards...'}</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-3xl">🃏</p>
            <p className="text-[13px] text-[var(--color-ink-muted)]">{language === 'id' ? 'Materi tidak ditemukan.' : 'No materials found.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((m, idx) => (
              <SpeakingCard
                key={m.id}
                material={m}
                index={idx}
                viewMode="desktop"
                isPracticed={practicedIds.has(m.id)}
                onSuccessSubmit={handleSuccessSubmit}
              />
            ))}
          </div>
        )}
      </div>

      {/* ════ MOBILE LAYOUT — TikTok Reels ════ */}
      <div className="lg:hidden w-full relative bg-[#090b0c]">

        {/* Category navbar — at the absolute top for mobile fullscreen layout */}
        <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-2 bg-black/70 backdrop-blur-md border-b border-white/10">
          <Link href="/dashboard/practice" className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white text-sm font-bold shrink-0 hover:bg-white/20 transition-colors">
            ←
          </Link>
          <div className="flex items-center bg-white/10 border border-white/10 rounded-full p-0.5 gap-0.5 mx-3">
            {CATEGORIES.map(({ key, emoji, labelId, labelEn }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  activeCategory === key
                    ? 'bg-[var(--color-primary)] text-white shadow-[0_0_10px_rgba(58,134,255,0.4)]'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <span>{emoji}</span>
                <span>{language === 'id' ? labelId : labelEn}</span>
              </button>
            ))}
          </div>
          {/* Progress badge */}
          <div className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-full px-2.5 py-1 shrink-0">
            <span className="text-white text-[11px] font-black">{completedCount}/{materials.length}</span>
            <span className="text-xs">✅</span>
          </div>
        </div>

        {/* Reels scroll container */}
        {isLoading ? (
          <div className="h-dvh flex items-center justify-center bg-[#090b0c]">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          </div>
        ) : materials.length === 0 ? (
          <div className="h-dvh flex flex-col items-center justify-center bg-[#090b0c] gap-3">
            <p className="text-4xl">🃏</p>
            <p className="text-white/50 text-sm">{language === 'id' ? 'Materi tidak ditemukan.' : 'No materials found.'}</p>
          </div>
        ) : (() => {
          const uncompletedMaterials = materials.filter(m => !practicedIds.has(m.id));
          
          if (uncompletedMaterials.length === 0) {
            return (
              <div className="h-dvh flex flex-col items-center justify-center bg-[#090b0c] gap-3 px-8 text-center animate-fade-in">
                <p className="text-6xl animate-bounce">🎉</p>
                <p className="text-white text-lg font-bold">
                  {language === 'id' ? 'Latihan Hari Ini Selesai!' : "Today's Practice Completed!"}
                </p>
                <p className="text-white/60 text-sm max-w-xs">
                  {language === 'id'
                    ? 'Semua kartu speaking kategori ini sudah diselesaikan. Kembali lagi besok untuk kartu baru! 🌅'
                    : 'All speaking cards for this category are finished. Come back tomorrow for new cards! 🌅'}
                </p>
                <Link href="/dashboard/practice" className="mt-4 px-6 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-95 transition-opacity">
                  {language === 'id' ? 'Kembali ke Latihan' : 'Back to Practice'}
                </Link>
              </div>
            );
          }

          // Loop remaining materials dynamically for infinite scroll feel
          const loopedMaterials = Array.from({ length: 15 }).flatMap(() => uncompletedMaterials);

          return (
            <div
              className="w-full overflow-y-scroll"
              style={{ height: '100dvh', scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
            >
              {loopedMaterials.map((m, idx) => (
                <SpeakingCard
                  key={`${m.id}-loop-${idx}`}
                  material={m}
                  index={idx}
                  viewMode="mobile"
                  isPracticed={false}
                  onSuccessSubmit={handleSuccessSubmit}
                />
              ))}
            </div>
          );
        })()}
      </div>
    </>
  );
}
