'use client';
// src/components/features/NotificationBell.tsx
// Lonceng notifikasi dengan dropdown misi harian

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/components/ui/Toast';

interface MissionItem {
  id: string;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  icon: string;
  isCompleted: boolean;
  isClaimed: boolean;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [missions, setMissions] = useState<MissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const hasUnclaimed = missions.some((m) => m.isCompleted && !m.isClaimed);
  const hasIncomplete = missions.some((m) => !m.isCompleted);
  const showBadge = hasUnclaimed || (missions.length > 0 && hasIncomplete);

  const loadMissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/missions');
      const data = await res.json();
      setMissions(data.missions ?? []);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleClaim = async (missionId: string, xpReward: number) => {
    setClaimingId(missionId);
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 +${xpReward} XP claimed!`, 'success', 3000);
        // Mark as claimed in local state
        setMissions((prev) =>
          prev.map((m) => (m.id === missionId ? { ...m, isClaimed: true } : m))
        );
      }
    } catch {
      showToast('Failed to claim reward. Try again.', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  const progressPercent = (current: number, target: number) =>
    Math.min(100, Math.round((current / target) * 100));

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Notifications"
        className={cn(
          'w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center',
          'bg-[var(--color-surface-card)] border border-[var(--color-hairline)]',
          'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]',
          'hover:border-[var(--color-ink-muted)] transition-colors relative'
        )}
      >
        <BellIcon className="w-4 h-4" />
        {showBadge && (
          <span
            className={cn(
              'absolute top-1 right-1 w-2 h-2 rounded-full',
              hasUnclaimed ? 'bg-[var(--color-success)] animate-pulse' : 'bg-[var(--color-primary)]'
            )}
          />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-11 w-80 z-[100] animate-fade-in-down"
          style={{
            background: 'var(--color-surface-modal)',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--color-hairline)' }}
          >
            <div>
              <p className="text-[14px] font-semibold text-[var(--color-ink)]">Daily Missions</p>
              <p className="text-[11px] text-[var(--color-ink-muted)]">
                {missions.filter((m) => m.isCompleted).length}/{missions.length} completed
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-active)] transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          {/* Mission List */}
          <div className="p-3 space-y-2 max-h-[340px] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl skeleton" />
              ))
            ) : missions.length === 0 ? (
              <p className="text-center text-[13px] text-[var(--color-ink-muted)] py-6">
                No missions today yet.
              </p>
            ) : (
              missions.map((m) => {
                const pct = progressPercent(m.currentValue, m.targetValue);
                return (
                  <div
                    key={m.id}
                    className="rounded-xl p-3 transition-all"
                    style={{
                      background: m.isClaimed
                        ? 'rgba(16,185,129,0.06)'
                        : m.isCompleted
                        ? 'rgba(58,134,255,0.08)'
                        : 'var(--color-surface-soft)',
                      border: m.isCompleted && !m.isClaimed
                        ? '1px solid rgba(58,134,255,0.25)'
                        : '1px solid var(--color-hairline-soft)',
                    }}
                  >
                    <div className="flex items-start gap-2.5 mb-2">
                      <span className="text-xl shrink-0 mt-0.5">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--color-ink)] leading-tight">
                          {m.title}
                        </p>
                        <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
                          {m.description}
                        </p>
                      </div>
                      <span
                        className="text-[11px] font-bold shrink-0"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        +{m.xpReward} XP
                      </span>
                    </div>

                    {/* Progress bar */}
                    {!m.isClaimed && (
                      <div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'var(--color-progress-bg)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: m.isCompleted
                                ? 'var(--color-success)'
                                : 'var(--color-primary)',
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-[var(--color-ink-muted)]">
                            {m.currentValue}/{m.targetValue}
                          </span>
                          <span className="text-[10px] text-[var(--color-ink-muted)]">{pct}%</span>
                        </div>
                      </div>
                    )}

                    {/* Claim button */}
                    {m.isCompleted && !m.isClaimed && (
                      <button
                        onClick={() => handleClaim(m.id, m.xpReward)}
                        disabled={claimingId === m.id}
                        className="w-full mt-2 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.97]"
                        style={{
                          background: 'var(--color-primary)',
                          color: '#fff',
                          opacity: claimingId === m.id ? 0.7 : 1,
                        }}
                      >
                        {claimingId === m.id ? '⏳ Claiming...' : `🎁 Claim +${m.xpReward} XP`}
                      </button>
                    )}

                    {m.isClaimed && (
                      <p className="text-[11px] text-[var(--color-success)] font-semibold mt-1.5">
                        ✅ Reward claimed!
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-2.5"
            style={{ borderTop: '1px solid var(--color-hairline)' }}
          >
            <p className="text-[11px] text-[var(--color-ink-muted)] text-center">
              🔄 Missions refresh every day at midnight
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a7 7 0 0 0-7 7v4l-1.7 1.7A1 1 0 0 0 4 16h16a1 1 0 0 0 .7-1.7L19 13V9a7 7 0 0 0-7-7zm0 20a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z" />
    </svg>
  );
}
