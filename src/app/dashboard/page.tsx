'use client';
// src/app/dashboard/page.tsx — Main Dashboard

import { useAppStore } from '@/hooks/useAppStore';
import Link from 'next/link';
import StreakCalendar from '@/components/features/StreakCalendar';
import ProgressBar from '@/components/ui/ProgressBar';
import Card from '@/components/ui/Card';
import { getLevelInfoByXp, getXpProgress, formatXp } from '@/lib/utils/xp';
import { getTodayProgressPercent, getStreakBadge, formatDuration } from '@/lib/utils/streak';
import { getScenariosByLevel } from '@/lib/scenarios';
import { cn } from '@/lib/utils/cn';

export default function DashboardPage() {
  const { user, streak, todayProgress, weeklyProgress } = useAppStore();
  if (!user || !streak) return null;

  const levelInfo     = getLevelInfoByXp(user.currentXp);
  const xpPercent     = getXpProgress(user.currentXp);
  const todayPercent  = getTodayProgressPercent(
    todayProgress?.secondsSpoken ?? 0,
    user.dailyTargetMinutes * 60
  );
  const isMissionDone    = todayProgress?.isMissionCompleted ?? false;
  const streakBadge      = getStreakBadge(streak.currentStreak);
  const suggestedScenarios = getScenariosByLevel(user.currentLevel).slice(0, 2);

  return (
    <div className="px-0 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-8 space-y-4 animate-fade-in max-w-7xl mx-auto w-full">

      {/* ── Greeting ───────────────────────────────── */}
      <div className="flex items-center justify-between mb-2 px-4 sm:px-0">
        <div>
          <p className="text-[12px] text-[var(--color-ink-muted)] font-medium uppercase tracking-[0.05em] mb-0.5">
            Good day,
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
                  <p className="text-[12px] text-[var(--color-ink-muted)] mt-0.5">Day Streak</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {streakBadge && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-[var(--radius-full)] bg-[var(--color-orange)] text-[var(--color-on-primary)]">
                    {streakBadge}
                  </span>
                )}
                <div className="text-right">
                  <p className="text-[13px] font-bold text-[var(--color-ink)]">Best: {streak.longestStreak}</p>
                  <p className="text-[11px] text-[var(--color-ink-muted)]">days</p>
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
              <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">Today&apos;s Mission</h2>
              <span
                className={cn(
                  'text-[11px] font-semibold px-2.5 py-1 rounded-[var(--radius-full)]',
                  isMissionDone
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'bg-[var(--color-surface-active)] text-[var(--color-ink-muted)] border border-[var(--color-hairline)]'
                )}
              >
                {isMissionDone ? '✅ Done!' : `${formatDuration(todayProgress?.secondsSpoken ?? 0)} / ${user.dailyTargetMinutes}m`}
              </span>
            </div>
            <ProgressBar
              value={todayPercent}
              variant={isMissionDone ? 'accent' : 'brand'}
              size="lg"
              showLabel
              label={`${Math.round(todayPercent)}% of daily goal`}
            />
            {!isMissionDone && (
              <p className="text-[12px] text-[var(--color-ink-muted)] mt-2">
                {formatDuration(Math.max(0, user.dailyTargetMinutes * 60 - (todayProgress?.secondsSpoken ?? 0)))} remaining today
              </p>
            )}
          </Card>
        </div>

        {/* Right column: XP / Level & Quick Practice */}
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
              {formatXp(levelInfo.xpNext - user.currentXp)} XP to next level
            </p>
          </Card>

          {/* ── Quick Practice ──────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3 px-4 sm:px-0">
              <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">Quick Practice</h2>
              <Link href="/dashboard/practice" className="text-[12px] text-[var(--color-primary)] hover:underline font-medium">
                See all →
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
