'use client';
// src/app/dashboard/leaderboard/page.tsx
// Global Leaderboard — Liga Harian, Mingguan, Bulanan, Semua Waktu

import { useState, useEffect } from 'react';
import { getLevelInfoByXp } from '@/lib/utils/xp';
import { cn } from '@/lib/utils/cn';
import Card from '@/components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';

interface LeaderboardEntry {
  rank: number;
  id: string;
  fullName: string;
  avatar: string;
  currentXp: number;
  weeklyXp: number; // dynamically mapped as period XP from backend API
  currentLevel: string;
  isCurrentUser: boolean;
}

const RANK_CONFIG = [
  { emoji: '🥇', color: '#fbbf24', glow: 'rgba(251,191,36,0.3)' },
  { emoji: '🥈', color: '#9ca3af', glow: 'rgba(156,163,175,0.3)' },
  { emoji: '🥉', color: '#b45309', glow: 'rgba(180,83,9,0.3)' },
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('weekly');
  const { language } = useTranslation();

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        setLeaderboard(data.leaderboard ?? []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [period]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const myRank = leaderboard.find((u) => u.isCurrentUser);

  const periodConfigs = {
    daily: {
      title: language === 'id' ? '🏆 Liga Harian' : '🏆 Daily League',
      subtitle: language === 'id' ? 'Bersaing hari ini · Reset setiap tengah malam' : 'Compete today · Resets every midnight',
      xpLabel: language === 'id' ? 'XP hari ini' : 'XP today',
      posLabel: language === 'id' ? 'Posisi Anda hari ini' : 'Your position today',
    },
    weekly: {
      title: language === 'id' ? '🏆 Liga Mingguan' : '🏆 Weekly League',
      subtitle: language === 'id' ? 'Bersaing mingguan · Reset setiap hari Minggu tengah malam' : 'Compete weekly · Resets every Sunday midnight',
      xpLabel: language === 'id' ? 'XP minggu ini' : 'XP this week',
      posLabel: language === 'id' ? 'Posisi Anda minggu ini' : 'Your position this week',
    },
    monthly: {
      title: language === 'id' ? '🏆 Liga Bulanan' : '🏆 Monthly League',
      subtitle: language === 'id' ? 'Bersaing bulanan · Reset setiap akhir bulan' : 'Compete monthly · Resets every end of month',
      xpLabel: language === 'id' ? 'XP bulan ini' : 'XP this month',
      posLabel: language === 'id' ? 'Posisi Anda bulan ini' : 'Your position this month',
    },
    alltime: {
      title: language === 'id' ? '🏆 Liga Semua Waktu' : '🏆 All-Time League',
      subtitle: language === 'id' ? 'Akumulasi XP sepanjang waktu sejak bergabung' : 'Cumulative XP accumulated since joining',
      xpLabel: language === 'id' ? 'Total XP' : 'Total XP',
      posLabel: language === 'id' ? 'Posisi Anda sepanjang waktu' : 'Your position all-time',
    },
  };

  return (
    <div className="px-0 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-10 space-y-5 animate-fade-in max-w-2xl mx-auto w-full">

      {/* ── Header ─────────────────────────────────── */}
      <div className="px-4 sm:px-0">
        <h1 className="font-display-md text-[var(--color-ink)]">{periodConfigs[period].title}</h1>
        <p className="text-[13px] text-[var(--color-ink-muted)] mt-1">
          {periodConfigs[period].subtitle}
        </p>
      </div>

      {/* ── Period Selector (Tabs) ─────────────────── */}
      <div className="mx-4 sm:mx-0 p-1 flex rounded-[var(--radius-xl)]" style={{ background: 'var(--color-surface-hover)' }}>
        {(['daily', 'weekly', 'monthly', 'alltime'] as const).map((p) => {
          const isActive = period === p;
          let label = '';
          if (p === 'daily') label = language === 'id' ? 'Harian' : 'Daily';
          else if (p === 'weekly') label = language === 'id' ? 'Mingguan' : 'Weekly';
          else if (p === 'monthly') label = language === 'id' ? 'Bulanan' : 'Monthly';
          else if (p === 'alltime') label = language === 'id' ? 'Semua Waktu' : 'All-Time';

          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex-1 py-2 text-[11px] sm:text-[13px] font-bold rounded-[var(--radius-lg)] transition-all"
              style={{
                color: isActive ? 'var(--color-primary)' : 'var(--color-ink-muted)',
                background: isActive ? 'var(--color-surface-card)' : 'transparent',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── My position banner ─────────────────────── */}
      {myRank && (
        <div
          className="mx-4 sm:mx-0 p-4 rounded-[var(--radius-xl)] flex items-center gap-3"
          style={{
            background: 'rgba(58,134,255,0.1)',
            border: '1px solid rgba(58,134,255,0.25)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-black text-white shrink-0"
            style={{ background: 'var(--color-primary)' }}
          >
            {myRank.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[var(--color-ink)]">{periodConfigs[period].posLabel}</p>
            <p className="text-[12px] text-[var(--color-ink-muted)]">{myRank.weeklyXp} {periodConfigs[period].xpLabel}</p>
          </div>
          <div
            className="text-[24px] font-black px-3 py-1 rounded-xl"
            style={{ background: 'rgba(58,134,255,0.2)', color: 'var(--color-primary)' }}
          >
            #{myRank.rank}
          </div>
        </div>
      )}

      {/* ── Top 3 Podium ────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 mx-4 sm:mx-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-[var(--radius-xl)] skeleton" />
          ))}
        </div>
      ) : top3.length > 0 ? (
        <div className="mx-4 sm:mx-0">
          {/* Podium layout: 2nd | 1st | 3rd */}
          <div className="grid grid-cols-3 gap-3 items-end">
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, podiumIdx) => {
              const actualRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
              const cfg = RANK_CONFIG[actualRank - 1];
              const height = actualRank === 1 ? 'h-44' : actualRank === 2 ? 'h-36' : 'h-32';

              return (
                <div
                  key={entry.id}
                  className={cn('flex flex-col items-center justify-end rounded-[var(--radius-xl)] p-3 transition-all', height, entry.isCurrentUser && 'ring-2 ring-[var(--color-primary)]')}
                  style={{
                    background: `linear-gradient(180deg, ${cfg.glow} 0%, var(--color-surface-card) 100%)`,
                    border: `1px solid ${cfg.color}40`,
                    boxShadow: actualRank === 1 ? `0 8px 24px ${cfg.glow}` : undefined,
                  }}
                >
                  <span className="text-2xl mb-1">{cfg.emoji}</span>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white mb-1.5"
                    style={{ background: cfg.color }}
                  >
                    {entry.avatar}
                  </div>
                  <p className="text-[11px] font-bold text-[var(--color-ink)] text-center truncate w-full leading-tight">
                    {entry.fullName.split(' ')[0]}
                  </p>
                  <p className="text-[11px] font-semibold mt-0.5" style={{ color: cfg.color }}>
                    {entry.weeklyXp} XP
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ── Full Ranking List ────────────────────────── */}
      <Card variant="default" padding="none">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl skeleton" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[32px] mb-2">🏃</p>
            <p className="text-[14px] font-semibold text-[var(--color-ink)]">
              {language === 'id' ? 'Belum ada peringkat!' : 'No rankings yet!'}
            </p>
            <p className="text-[12px] text-[var(--color-ink-muted)] mt-1">
              {language === 'id' 
                ? 'Jadilah yang pertama berlatih dan raih peringkat teratas.' 
                : 'Be the first to practice and claim the top spot.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-hairline)]">
            {leaderboard.map((entry) => {
              const levelInfo = getLevelInfoByXp(entry.currentXp);
              const isTop3 = entry.rank <= 3;
              const cfg = isTop3 ? RANK_CONFIG[entry.rank - 1] : null;

              // Promotion zone (top 5 = green), degradation zone (bottom 5 = red) - only active for weekly
              const isPromotion = period === 'weekly' && entry.rank <= 5;
              const isDegradation = period === 'weekly' && leaderboard.length > 10 && entry.rank >= leaderboard.length - 4;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-all',
                    entry.isCurrentUser && 'bg-[rgba(58,134,255,0.06)]',
                  )}
                >
                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    {cfg ? (
                      <span className="text-lg">{cfg.emoji}</span>
                    ) : (
                      <span
                        className="text-[13px] font-bold"
                        style={{
                          color: isPromotion
                            ? '#10b981'
                            : isDegradation
                            ? '#e45858'
                            : 'var(--color-ink-muted)',
                        }}
                      >
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black text-white shrink-0"
                    style={{ background: cfg ? cfg.color : levelInfo.color }}
                  >
                    {entry.avatar}
                  </div>

                  {/* Name + level */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[13px] font-semibold text-[var(--color-ink)] truncate', entry.isCurrentUser && 'text-[var(--color-primary)]')}>
                      {entry.fullName}
                      {entry.isCurrentUser && <span className="ml-1.5 text-[11px] font-bold" style={{ color: 'var(--color-primary)' }}>YOU</span>}
                    </p>
                    <p className="text-[11px] text-[var(--color-ink-muted)]" style={{ color: levelInfo.color }}>
                      {levelInfo.emoji} {levelInfo.label}
                    </p>
                  </div>

                  {/* Period XP */}
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold" style={{ color: cfg ? cfg.color : 'var(--color-ink)' }}>
                      {entry.weeklyXp}
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)]">
                      {periodConfigs[period].xpLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Legend - only visible for weekly period */}
      {period === 'weekly' && (
        <div className="flex gap-4 px-4 sm:px-0 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-4 rounded-sm" style={{ background: '#10b981' }} />
            <span className="text-[11px] text-[var(--color-ink-muted)]">
              {language === 'id' ? 'Zona Promosi (top 5)' : 'Promotion zone (top 5)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-4 rounded-sm" style={{ background: '#e45858' }} />
            <span className="text-[11px] text-[var(--color-ink-muted)]">
              {language === 'id' ? 'Zona Degradasi (bottom 5)' : 'Demotion zone (bottom 5)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
