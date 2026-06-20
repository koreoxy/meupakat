'use client';

import { useMemo, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { format } from 'date-fns';
import Link from 'next/link';
import StreakCalendar from '@/components/features/StreakCalendar';
import ProgressBar from '@/components/ui/ProgressBar';
import Card from '@/components/ui/Card';
import { getLevelInfoByXp, getXpProgress, formatXp } from '@/lib/utils/xp';
import { getTodayProgressPercent, getStreakBadge, formatDuration } from '@/lib/utils/streak';
import { SCENARIOS } from '@/lib/scenarios';
import { cn } from '@/lib/utils/cn';
import { useTranslation, type Language } from '@/hooks/useTranslation';

// Rekomendasi dinamis berdasarkan level user
function getRecommendations(level: string) {
  const byLevel = SCENARIOS.filter((s) => s.level === level);
  const today = new Date();
  const seed = today.getDate() + today.getMonth();
  // Pick 2 different scenarios than the daily topic
  const recs = byLevel.filter((_, i) => i !== seed % byLevel.length).slice(0, 2);
  return recs.length >= 2 ? recs : byLevel.slice(0, 2);
}

const LEVEL_TIPS: Record<string, Record<Language, string>> = {
  beginner: {
    id: 'Latih sapaan sederhana dan percakapan sehari-hari untuk membangun rasa percaya diri.',
    en: 'Practice simple greetings and daily life conversations to build confidence.',
  },
  intermediate: {
    id: 'Coba skenario profesional untuk memperluas kosakata bahasa Inggris tempat kerja Anda.',
    en: 'Try professional scenarios to expand your workplace English vocabulary.',
  },
  advanced: {
    id: 'Tantang diri Anda dengan negosiasi bisnis dan diskusi akademik.',
    en: 'Challenge yourself with business negotiations and academic discussions.',
  },
};

export default function DashboardPage() {
  const { user, streak, todayProgress, weeklyProgress, completeSpeakingCard } = useAppStore();
  const { t, language } = useTranslation();

  if (!user || !streak) return null;

  const levelInfo     = getLevelInfoByXp(user.currentXp);
  const xpPercent     = getXpProgress(user.currentXp);
  const todayPercent  = getTodayProgressPercent(
    todayProgress?.secondsSpoken ?? 0,
    user.dailyTargetMinutes * 60
  );
  const isMissionDone    = todayProgress?.isMissionCompleted ?? false;
  const streakBadge      = getStreakBadge(streak.currentStreak);
  const suggestedScenarios = SCENARIOS.filter((s) => s.level === user.currentLevel).slice(0, 2);
  const recommendations  = useMemo(() => getRecommendations(user.currentLevel), [user.currentLevel]);

  // Hitung jumlah kartu yang selesai diselesaikan hari ini
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  let localPracticedCount = 0;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('meupakat_practiced_' + todayStr);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          localPracticedCount = parsed.length;
        }
      }
    } catch {}
  }
  const cardsCompleted = todayProgress?.isCardsMissionCompleted ? 5 : Math.min(5, localPracticedCount);
  const isCardsDone = (todayProgress?.isCardsMissionCompleted ?? false) || cardsCompleted >= 5;

  // Sinkronkan pengerjaan kartu di localStorage ke server jika belum terdata di DB
  useEffect(() => {
    if (typeof window !== 'undefined' && todayProgress && !todayProgress.isCardsMissionCompleted) {
      try {
        const raw = localStorage.getItem('meupakat_practiced_' + todayStr);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const syncCardCompletions = async () => {
              for (const id of parsed) {
                await completeSpeakingCard(id);
              }
            };
            syncCardCompletions();
          }
        }
      } catch (e) {
        console.error("Failed to sync card completions:", e);
      }
    }
  }, [todayProgress, todayStr, completeSpeakingCard]);

  // Daily login reward: show if no activity today yet
  const hasActivityToday = (todayProgress?.secondsSpoken ?? 0) > 0 || cardsCompleted > 0;
  const dayOfStreak = streak.currentStreak;

  return (
    <div className="px-0 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-8 space-y-4 animate-fade-in max-w-7xl mx-auto w-full">

      {/* ── Greeting ───────────────────────────────── */}
      <div className="flex items-center justify-between mb-2 px-4 sm:px-0">
        <div>
          <p className="text-[12px] text-[var(--color-ink-muted)] font-medium uppercase tracking-[0.05em] mb-0.5">
            {language === 'id' ? 'Halo,' : 'Good day,'}
          </p>
          <h1 className="font-display-md text-[var(--color-ink)]">
            {user.fullName.split(' ')[0]} 👋
          </h1>
        </div>
        <div
          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center font-black text-lg shrink-0"
          style={{ backgroundColor: `${levelInfo.color}20`, border: `1px solid ${levelInfo.color}40` }}
        >
          {levelInfo.emoji}
        </div>
      </div>

      {/* ── Daily Login Reward banner ──────────────── */}
      {!hasActivityToday && (
        <div
          className="mx-4 sm:mx-0 p-4 rounded-[var(--radius-xl)] flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 animate-fade-in-down"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.05) 100%)',
            border: '1px solid rgba(251,191,36,0.3)',
          }}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-2xl shrink-0 mt-0.5">🎁</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--color-ink)]">
                {language === 'id' ? 'Mulai latihan hari ini untuk mempertahankan streak Anda!' : 'Start today to keep your streak alive!'}
              </p>
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
                {dayOfStreak > 0
                  ? (language === 'id' ? `Anda memiliki streak ${dayOfStreak} hari 🔥 Jangan biarkan terputus!` : `You have a ${dayOfStreak}-day streak 🔥 Don't break it!`)
                  : (language === 'id' ? 'Mulai sesi pertama Anda hari ini dan bangun streak baru.' : 'Start your first session today and begin your streak.')}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/practice"
            className="px-4 py-2 rounded-[var(--radius-sm)] text-[12px] font-bold transition-all hover:opacity-90 active:scale-[0.97] shrink-0 w-full sm:w-auto text-center"
            style={{ background: '#fbbf24', color: '#000' }}
          >
            {language === 'id' ? 'Mulai Latihan →' : 'Practice →'}
          </Link>
        </div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left column: Streak Card & Today's Mission */}
        <div className="lg:col-span-7 space-y-4">
          {/* ── Streak card ─────────────────────────────── */}
          <Card
            variant="feature"
            style={streak.currentStreak > 0 ? { borderColor: '#ff8000' } : {}}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={cn('text-3xl', streak.currentStreak > 0 && 'animate-streak-fire')}>
                  🔥
                </span>
                <div>
                  <p className="font-display-md text-[var(--color-ink)] leading-none">{streak.currentStreak}</p>
                  <p className="text-[12px] text-[var(--color-ink-muted)] mt-0.5">{language === 'id' ? 'Streak Hari' : 'Day Streak'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {streakBadge && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-[var(--radius-full)] bg-[var(--color-orange)] text-[var(--color-on-primary)]">
                    {streakBadge}
                  </span>
                )}
                <div className="text-right">
                  <p className="text-[13px] font-bold text-[var(--color-ink)]">{language === 'id' ? 'Terbaik' : 'Best'}: {streak.longestStreak}</p>
                  <p className="text-[11px] text-[var(--color-ink-muted)]">{language === 'id' ? 'hari' : 'days'}</p>
                </div>
              </div>
            </div>

            <StreakCalendar
              weeklyProgress={weeklyProgress}
              targetMinutes={user.dailyTargetMinutes}
            />
          </Card>

          {/* ── Today's mission ─────────────────────────── */}
          <Card variant="feature">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">
                🎯 {language === 'id' ? 'Misi Hari Ini' : "Today's Missions"}
              </h2>
              <span
                className={cn(
                  'text-[11px] font-bold px-2.5 py-1 rounded-[var(--radius-full)]',
                  isMissionDone
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 animate-pulse'
                    : 'bg-[var(--color-surface-active)] text-[var(--color-ink-muted)] border border-[var(--color-hairline)]'
                )}
              >
                {isMissionDone 
                  ? (language === 'id' ? '🔥 Streak Aman!' : '🔥 Streak Secured!') 
                  : (language === 'id' ? '⏳ 1 Misi Lagi' : '⏳ 1 Mission Left')}
              </span>
            </div>

            <div className="space-y-4">
              {/* Mission 1: Speaking Time Goal */}
              <div className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔊</span>
                    <div>
                      <p className="text-[13px] font-bold text-[var(--color-ink)]">
                        {language === 'id' ? 'Misi 1: Target Durasi Berbicara' : 'Mission 1: Speaking Time Target'}
                      </p>
                      <p className="text-[11px] text-[var(--color-ink-muted)]">
                        {language === 'id' 
                          ? `Bicara bahasa Inggris selama ${user.dailyTargetMinutes} menit` 
                          : `Speak English for ${user.dailyTargetMinutes} minutes`}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-full",
                    (todayProgress?.secondsSpoken ?? 0) >= (user.dailyTargetMinutes * 60)
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-[var(--color-surface-active)] text-[var(--color-ink-muted)]"
                  )}>
                    {formatDuration(todayProgress?.secondsSpoken ?? 0)} / {user.dailyTargetMinutes}m
                  </span>
                </div>
                <ProgressBar
                  value={todayPercent}
                  variant={(todayProgress?.secondsSpoken ?? 0) >= (user.dailyTargetMinutes * 60) ? 'accent' : 'brand'}
                  size="md"
                />
              </div>

              {/* Mission 2: Complete Speaking Cards */}
              <div className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🃏</span>
                    <div>
                      <p className="text-[13px] font-bold text-[var(--color-ink)]">
                        {language === 'id' ? 'Misi 2: Selesaikan Semua Kartu Speaking' : 'Mission 2: Complete All Speaking Cards'}
                      </p>
                      <p className="text-[11px] text-[var(--color-ink-muted)]">
                        {language === 'id'
                          ? 'Selesaikan 5 kartu latihan berbicara hari ini'
                          : 'Complete 5 speaking practice cards today'}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-full",
                    isCardsDone
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-[var(--color-surface-active)] text-[var(--color-ink-muted)]"
                  )}>
                    {cardsCompleted} / 5 {language === 'id' ? 'kartu' : 'cards'}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 bg-[var(--color-surface-active)] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isCardsDone ? "bg-emerald-500" : "bg-[var(--color-primary)]"
                    )}
                    style={{ width: `${Math.min(100, (cardsCompleted / 5) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-[11.5px] text-[var(--color-ink-muted)] mt-3 text-center italic">
              {language === 'id'
                ? 'Selesaikan salah satu atau kedua misi di atas untuk mempertahankan Daily Streak Anda! 🌅'
                : 'Complete either or both missions above to preserve your Daily Streak! 🌅'}
            </p>
          </Card>

          {/* ── Smart Recommendations ─────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">{language === 'id' ? '🧠 Direkomendasikan untuk Anda' : '🧠 Recommended for You'}</h2>
                <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">{LEVEL_TIPS[user.currentLevel]?.[language]}</p>
              </div>
            </div>
            <div className="space-y-2">
              {recommendations.map((scenario, i) => (
                <Link
                  key={scenario.id}
                  href={`/dashboard/mission/${scenario.id}`}
                  id={`rec-card-${scenario.id}`}
                  className={cn(
                    'flex items-center gap-3 p-4',
                    'bg-[var(--color-surface-card)] border-y sm:border border-[var(--color-hairline)] border-x-0 sm:border-x rounded-none sm:rounded-[var(--radius-lg)]',
                    'hover:border-[var(--color-primary)] hover:ring-1 hover:ring-[var(--color-primary)]',
                    'transition-all duration-200 active:scale-[0.98]',
                    'animate-fade-in-up',
                  )}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div
                    className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: `${levelInfo.color}18`, border: `1px solid ${levelInfo.color}30` }}
                  >
                    🎯
                  </div>
                  <div className="flex-1 min-w-0 px-2 sm:px-0">
                    <p className="text-[14px] font-medium text-[var(--color-ink)] truncate">{scenario.title}</p>
                    <p className="text-[12px] text-[var(--color-ink-muted)] truncate">{scenario.description}</p>
                  </div>
                  <div className="text-right shrink-0 px-2 sm:px-0">
                    <p className="text-[12px] font-bold text-[var(--color-primary)]">+{scenario.xpReward} XP</p>
                    <p className="text-[11px] text-[var(--color-ink-muted)]">{scenario.durationMinutes}m</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: XP / Level & Quick Practice + Stats */}
        <div className="lg:col-span-5 space-y-4">
          {/* ── XP & Level ──────────────────────────────── */}
          <Card variant="feature">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${levelInfo.color}20`, border: `1px solid ${levelInfo.color}40` }}
              >
                {levelInfo.emoji}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-semibold" style={{ color: levelInfo.color }}>
                    {levelInfo.label}
                  </span>
                  <span className="text-[12px] text-[var(--color-ink-muted)]">{formatXp(user.currentXp)} XP</span>
                </div>
                <ProgressBar value={xpPercent} variant="xp" size="md" />
              </div>
            </div>
            <p className="text-[12px] text-[var(--color-ink-muted)]">
              {formatXp(levelInfo.xpNext - user.currentXp)} {language === 'id' ? 'XP ke level berikutnya' : 'XP to next level'}
            </p>
          </Card>

          {/* ── Quick links ─────────────────────────────── */}
          <Card variant="default" padding="sm">
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/dashboard/stats',       icon: '📊', label: t('nav_stats'),    color: '#3a86ff' },
                { href: '/dashboard/leaderboard',  icon: '🏆', label: t('nav_leaderboard'), color: '#fbbf24' },
                { href: '/dashboard/vocabulary',   icon: '📚', label: t('nav_vocabulary'),  color: '#10b981' },
                { href: '/dashboard/practice',     icon: '🎤', label: t('nav_practice'),    color: '#8b5cf6' },
              ].map(({ href, icon, label, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-[var(--radius-md)] transition-all duration-200 hover:bg-[var(--color-surface-active)] active:scale-[0.97] text-center"
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-[11px] font-semibold text-[var(--color-ink-muted)]">{label}</span>
                </Link>
              ))}
            </div>
          </Card>

          {/* ── Quick Practice ──────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3 px-4 sm:px-0">
              <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">{language === 'id' ? 'Latihan Cepat' : 'Quick Practice'}</h2>
              <Link href="/dashboard/practice" className="text-[12px] text-[var(--color-primary)] hover:underline font-medium">
                {language === 'id' ? 'Lihat semua →' : 'See all →'}
              </Link>
            </div>
            <div className="space-y-2">
              {suggestedScenarios.map((scenario, i) => (
                <Link
                  key={scenario.id}
                  href={`/dashboard/mission/${scenario.id}`}
                  id={`scenario-card-${scenario.id}`}
                  className={cn(
                    'flex items-center gap-3 p-4',
                    'bg-[var(--color-surface-card)] border-y sm:border border-[var(--color-hairline)] border-x-0 sm:border-x rounded-none sm:rounded-[var(--radius-lg)]',
                    'hover:border-[var(--color-primary)] hover:ring-1 hover:ring-[var(--color-primary)]',
                    'transition-all duration-200 active:scale-[0.98]',
                    'animate-fade-in-up',
                  )}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div
                    className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: `${levelInfo.color}18`, border: `1px solid ${levelInfo.color}30` }}
                  >
                    🎯
                  </div>
                  <div className="flex-1 min-w-0 px-2 sm:px-0">
                    <p className="text-[14px] font-medium text-[var(--color-ink)] truncate">{scenario.title}</p>
                    <p className="text-[12px] text-[var(--color-ink-muted)] truncate">{scenario.description}</p>
                  </div>
                  <div className="text-right shrink-0 px-2 sm:px-0">
                    <p className="text-[12px] font-bold text-[var(--color-primary)]">+{scenario.xpReward} XP</p>
                    <p className="text-[11px] text-[var(--color-ink-muted)]">{scenario.durationMinutes}m</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
