'use client';
// src/app/dashboard/profile/page.tsx

import { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { useToast } from '@/components/ui/Toast';
import { getLevelInfoByXp, getXpProgress, VALORANT_RANKS, formatXp } from '@/lib/utils/xp';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import { useRouter } from 'next/navigation';

const TARGET_OPTIONS = [5, 10, 15, 30, 60];

export default function ProfilePage() {
  const { user, streak, updateDailyTarget, logout } = useAppStore();
  const { showToast } = useToast();
  const router = useRouter();

  const [selectedTarget, setSelectedTarget] = useState(user?.dailyTargetMinutes ?? 10);
  const [isSaving, setIsSaving] = useState(false);

  if (!user || !streak) return null;

  const levelInfo = getLevelInfoByXp(user.currentXp);
  const xpPercent = getXpProgress(user.currentXp);

  const handleSaveTarget = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateDailyTarget(selectedTarget);
    showToast(`✅ Daily target updated to ${selectedTarget} minutes!`, 'success');
    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <div className="px-0 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-10 space-y-4 animate-fade-in max-w-5xl mx-auto w-full">

      {/* ── Header ─────────────────────────────────── */}
      <h1 className="font-display-md text-[var(--color-ink)] mb-2 px-4 sm:px-0">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left column: User info, Stats, Target & Logout */}
        <div className="lg:col-span-7 space-y-4">
          {/* ── User card ───────────────────────────────── */}
          <Card variant="glass">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center text-2xl font-black shrink-0 text-white"
                style={{ backgroundColor: `${levelInfo.color}25`, border: `1.5px solid ${levelInfo.color}50` }}
              >
                {user.fullName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[16px] font-semibold text-[var(--color-ink)] truncate">{user.fullName}</h2>
                <p className="text-[12px] text-[var(--color-ink-muted)] truncate mt-0.5">{user.email}</p>
                <span
                  className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-[var(--radius-full)] mt-2"
                  style={{ backgroundColor: `${levelInfo.color}20`, color: levelInfo.color }}
                >
                  {levelInfo.emoji} {levelInfo.label}
                </span>
              </div>
            </div>

            {/* XP bar */}
            <div className="mt-5 pt-4 border-t border-[var(--color-hairline)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-[var(--color-ink-muted)] font-medium uppercase tracking-[0.05em]">Experience Points</span>
                <span className="text-[12px] font-bold" style={{ color: levelInfo.color }}>{formatXp(user.currentXp)} XP</span>
              </div>
              <ProgressBar value={xpPercent} variant="xp" size="md" />
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-1.5">
                {formatXp(levelInfo.xpNext - user.currentXp)} XP to {
                  VALORANT_RANKS.find(b => b.xpRequired > user.currentXp)?.label ?? 'Max Level'
                }
              </p>
            </div>
          </Card>

          {/* ── Stats row ───────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 px-4 sm:px-0">
            {[
              { label: 'Day Streak', value: streak.currentStreak,  icon: '🔥', color: '#f97316' },
              { label: 'Best Streak', value: streak.longestStreak, icon: '⚡', color: '#8b5cf6' },
              { label: 'Total XP',   value: user.currentXp,        icon: '✨', color: '#3a86ff' },
            ].map(({ label, value, icon, color }) => (
              <Card key={label} variant="default" padding="sm">
                <div className="text-center">
                  <span className="text-xl block mb-1">{icon}</span>
                  <p className="text-lg font-black leading-none" style={{ color }}>{value}</p>
                  <p className="text-[10px] text-[var(--color-ink-muted)] mt-1 font-medium">{label}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* ── Daily target ────────────────────────────── */}
          <Card variant="default">
            <h3 className="text-[13px] font-semibold text-[var(--color-ink)] mb-0.5">Daily Target</h3>
            <p className="text-[11px] text-[var(--color-ink-muted)] mb-4">
              How many minutes of speaking practice per day?
            </p>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {TARGET_OPTIONS.map((min) => (
                <button
                  key={min}
                  id={`target-${min}-btn`}
                  onClick={() => setSelectedTarget(min)}
                  className={cn(
                    'py-2 rounded-[var(--radius-sm)] text-[12px] font-bold border transition-all duration-200',
                    selectedTarget === min
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-on-primary)]'
                      : 'bg-[var(--color-surface-active)] border-[var(--color-hairline)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  )}
                >
                  {min}m
                </button>
              ))}
            </div>
            <Button
              id="save-target-btn"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isSaving}
              disabled={selectedTarget === user.dailyTargetMinutes}
              onClick={handleSaveTarget}
            >
              {selectedTarget === user.dailyTargetMinutes ? 'Current target' : 'Save target'}
            </Button>
          </Card>

          {/* ── Logout ──────────────────────────────────── */}
          <div className="px-4 sm:px-0">
            <Button
              id="logout-btn"
              variant="danger"
              size="md"
              fullWidth
              onClick={handleLogout}
            >
              🚪 Sign Out
            </Button>
          </div>
        </div>

        {/* Right column: Level Journey */}
        <div className="lg:col-span-5">
          {/* ── Level journey ───────────────────────────── */}
          <Card variant="default">
            <h3 className="text-[13px] font-semibold text-[var(--color-ink)] mb-4">Level Journey</h3>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {VALORANT_RANKS.map((bracket) => {
                const isUnlocked = user.currentXp >= bracket.xpRequired;
                const isCurrent  = levelInfo.label === bracket.label;
                return (
                  <div
                    key={bracket.label}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-[var(--radius-md)] border transition-all duration-300',
                      isCurrent
                        ? 'border-opacity-100'
                        : isUnlocked
                        ? 'border-[var(--color-hairline)] bg-[var(--color-surface-active)]'
                        : 'border-[var(--color-hairline)] opacity-40'
                    )}
                    style={
                      isCurrent
                        ? {
                            borderColor: bracket.color,
                            backgroundColor: `${bracket.color}10`,
                          }
                        : {}
                    }
                  >
                    <span className="text-xl">{bracket.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: isUnlocked ? bracket.color : 'var(--color-ink-disabled)' }}>
                        {bracket.label}
                      </p>
                      <p className="text-[11px] text-[var(--color-ink-muted)]">
                        {bracket.xpRequired} – {bracket.xpNext} XP
                      </p>
                    </div>
                    {isUnlocked && !isCurrent && (
                      <span className="text-[11px] font-bold text-[var(--color-success)]">✓</span>
                    )}
                    {isCurrent && (
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-[var(--radius-full)]"
                        style={{ backgroundColor: `${bracket.color}20`, color: bracket.color }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
