'use client';
// src/app/dashboard/practice/page.tsx — All scenarios by level + Daily Topic of the Day

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/hooks/useAppStore';
import { SCENARIOS } from '@/lib/scenarios';
import { getLevelInfoByXp } from '@/lib/utils/xp';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import type { UserLevel } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

const TABS: { value: UserLevel; labelEn: string; labelId: string; emoji: string }[] = [
  { value: 'beginner',     labelEn: 'Beginner',     labelId: 'Pemula',     emoji: '🌱' },
  { value: 'intermediate', labelEn: 'Intermediate', labelId: 'Menengah',    emoji: '🚀' },
  { value: 'advanced',     labelEn: 'Advanced',     labelId: 'Mahir',       emoji: '⚡' },
];

const TAB_COLORS: Record<UserLevel, string> = {
  beginner:     '#10b981',
  intermediate: '#3a86ff',
  advanced:     '#8b5cf6',
};

const SCENARIO_EMOJIS = ['🍽️', '🤝', '💼', '📊', '🎤', '🌍', '📱', '🏢'];

// Rotasi topik deterministik berdasarkan tanggal + level
function getDailyTopic(level: UserLevel): { scenario: (typeof SCENARIOS)[0]; vocabHints: string[] } {
  const today = format(new Date(), 'yyyyMMdd');
  const dayNum = parseInt(today.slice(-2));
  const monthNum = parseInt(today.slice(4, 6));
  const levelScenarios = SCENARIOS.filter((s) => s.level === level);
  const idx = (dayNum + monthNum) % levelScenarios.length;
  const scenario = levelScenarios[idx];

  // Vocab hints based on expected keywords from all turns
  const allKeywords = scenario.turns.flatMap((t) => t.expectedKeywords ?? []);
  const uniqueKw = [...new Set(allKeywords)].slice(0, 5);

  return { scenario, vocabHints: uniqueKw };
}

export default function PracticePage() {
  const { user } = useAppStore();
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<UserLevel>(user?.currentLevel ?? 'beginner');

  const filtered = SCENARIOS.filter((s) => s.level === activeTab);
  const color = TAB_COLORS[activeTab];
  const { scenario: dailyScenario, vocabHints } = useMemo(() => getDailyTopic(activeTab), [activeTab]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-10 animate-fade-in">

      {/* ── Header ─────────────────────────────────── */}
      <div className="mb-5">
        <h1 className="font-display-md text-[var(--color-ink)]">{t('nav_practice')}</h1>
        <p className="text-[13px] text-[var(--color-ink-muted)] mt-1">
          {language === 'id' ? 'Pilih skenario dan mulailah berbicara!' : 'Choose a scenario and start speaking!'}
        </p>
      </div>

      {/* ── Level tabs ─────────────────────────────── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 custom-scrollbar">
        {TABS.map(({ value, labelEn, labelId, emoji }) => {
          const isActive = activeTab === value;
          const label = language === 'id' ? labelId : labelEn;
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

      {/* ── 🌟 Today's Topic Card ──────────────────── */}
      <Link
        href={`/dashboard/mission/${dailyScenario.id}`}
        id={`daily-topic-card`}
        className="block mb-6 rounded-[var(--radius-xl)] overflow-hidden transition-all duration-200 active:scale-[0.99] group"
        style={{
          background: `linear-gradient(135deg, ${color}25 0%, ${color}08 100%)`,
          border: `1px solid ${color}35`,
          boxShadow: `0 4px 24px ${color}15`,
        }}
      >
        <div className="p-5">
          {/* Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                style={{ background: `${color}25`, color }}
              >
                🌟 {language === 'id' ? 'Topik Hari Ini' : "Today's Topic"}
              </span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.15)', color: 'rgba(255,255,255,0.85)' }}
              >
                {language === 'id' ? 'Diperbarui setiap hari' : 'Refreshes daily'}
              </span>
            </div>
            <span className="text-[12px] font-bold" style={{ color }}>+{dailyScenario.xpReward} XP</span>
          </div>

          {/* Content */}
          <h2 className="text-[18px] font-black text-[var(--color-ink)] mb-1 leading-tight">
            {dailyScenario.title}
          </h2>
          <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed mb-4">
            {dailyScenario.description}
          </p>

          {/* Vocab hints */}
          {vocabHints.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-2">
                🔑 {language === 'id' ? 'Kosakata Kunci' : 'Key Vocabulary'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {vocabHints.map((kw) => (
                  <span
                    key={kw}
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium capitalize"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}25` }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <div
            className="mt-5 flex items-center gap-2 font-semibold text-[13px] transition-transform group-hover:translate-x-1"
            style={{ color }}
          >
            {language === 'id' ? 'Mulai Topik Hari Ini →' : 'Start Today\'s Topic →'}
          </div>
        </div>
      </Link>

      {/* ── Section title ───────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-[14px] font-semibold text-[var(--color-ink)]">{language === 'id' ? 'Semua Skenario' : 'All Scenarios'}</h2>
        <div className="flex-1 h-px" style={{ background: 'var(--color-hairline)' }} />
        <span className="text-[12px] text-[var(--color-ink-muted)]">{filtered.length} {language === 'id' ? 'topik' : 'topics'}</span>
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
              'animate-fade-in-up',
              scenario.id === dailyScenario.id && 'ring-1 ring-opacity-50',
            )}
            style={{
              animationDelay: `${i * 0.06}s`,
              ...(scenario.id === dailyScenario.id
                ? { borderColor: color, boxShadow: `0 0 0 1px ${color}40` }
                : {}),
            }}
          >
            {/* Card top row */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
              >
                {SCENARIO_EMOJIS[i % SCENARIO_EMOJIS.length]}
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
                  {scenario.id === dailyScenario.id && (
                    <span className="text-[10px] font-bold" style={{ color }}>{language === 'id' ? 'Hari Ini ✦' : 'Today ✦'}</span>
                  )}
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
                {scenario.turns.length} {language === 'id' ? 'giliran' : 'turns'}
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
