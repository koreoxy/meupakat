'use client';
// src/app/dashboard/practice/page.tsx — All scenarios by level

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/hooks/useAppStore';
import { SCENARIOS } from '@/lib/scenarios';
import { getLevelInfoByXp } from '@/lib/utils/xp';
import { cn } from '@/lib/utils/cn';
import type { UserLevel } from '@/types';

const TABS: { value: UserLevel; label: string; emoji: string }[] = [
  { value: 'beginner',     label: 'Beginner',     emoji: '🌱' },
  { value: 'intermediate', label: 'Intermediate', emoji: '🚀' },
  { value: 'advanced',     label: 'Advanced',     emoji: '⚡' },
];

const TAB_COLORS: Record<UserLevel, string> = {
  beginner:     '#10b981',
  intermediate: '#3a86ff',
  advanced:     '#8b5cf6',
};

const SCENARIO_EMOJIS = ['🍽️', '🤝', '💼', '📊', '🎤', '🌍', '📱', '🏢'];

export default function PracticePage() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<UserLevel>(user?.currentLevel ?? 'beginner');

  const filtered = SCENARIOS.filter((s) => s.level === activeTab);
  const color     = TAB_COLORS[activeTab];

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-10 animate-fade-in">

      {/* ── Header ─────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-display-md text-[var(--color-ink)]">Practice</h1>
        <p className="text-[13px] text-[var(--color-ink-muted)] mt-1">
          Choose a scenario and start speaking!
        </p>
      </div>

      {/* ── Level tabs ─────────────────────────────── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(({ value, label, emoji }) => {
          const isActive = activeTab === value;
          return (
            <button
              key={value}
              id={`tab-${value}`}
              onClick={() => setActiveTab(value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-[13px] font-semibold shrink-0 transition-all duration-200 border',
                isActive
                  ? 'text-[var(--color-on-primary)] border-transparent'
                  : 'bg-[var(--color-surface-card)] text-[var(--color-ink-secondary)] border-[var(--color-hairline)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-muted)]'
              )}
              style={isActive ? { backgroundColor: color, borderColor: color } : {}}
            >
              <span>{emoji}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Cards grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((scenario, i) => (
          <Link
            key={scenario.id}
            href={`/dashboard/mission/${scenario.id}`}
            id={`scenario-${scenario.id}`}
            className={cn(
              'flex flex-col p-5 rounded-[var(--radius-xl)]',
              'bg-[var(--color-surface-card)] border border-[var(--color-hairline)]',
              'hover:border-[var(--color-primary)] hover:ring-1 hover:ring-[var(--color-primary)]',
              'transition-all duration-200 active:scale-[0.98] group',
              'animate-fade-in-up'
            )}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {/* Card top row */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
              >
                {/* @ts-ignore */}
                {scenario.emoji || SCENARIO_EMOJIS[i % SCENARIO_EMOJIS.length]}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-[14px] font-semibold text-[var(--color-ink)] leading-tight truncate">
                  {scenario.title}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-[var(--radius-xs)]"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    +{scenario.xpReward} XP
                  </span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">⏱ {scenario.durationMinutes}m</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-[12px] text-[var(--color-ink-muted)] leading-relaxed flex-1 line-clamp-2">
              {scenario.description}
            </p>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-[var(--color-hairline)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-ink-muted)] font-medium">
                {scenario.turns.length} turns
              </span>
              <div
                className="w-8 h-8 rounded-[var(--radius-full)] flex items-center justify-center text-xs font-bold transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface-active)',
                  color: 'var(--color-ink-secondary)',
                }}
              >
                ▶
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
