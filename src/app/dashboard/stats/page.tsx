'use client';
// src/app/dashboard/stats/page.tsx
// Halaman statistik belajar dengan grafik Recharts

import { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { getLevelInfoByXp, formatXp } from '@/lib/utils/xp';
import { format, subDays } from 'date-fns';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import { getAllProgress } from '@/app/actions/progress';
import { getMyVocabularies } from '@/app/actions/vocabulary';
import type { DailyProgress } from '@/types';

type Range = '7d' | '30d' | 'all';

interface DayData {
  date: string;
  label: string;
  minutes: number;
  xp: number;
}

export default function StatsPage() {
  const { user, streak } = useAppStore();
  const [range, setRange] = useState<Range>('7d');
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [vocabCount, setVocabCount] = useState(0);
  const [allProgress, setAllProgress] = useState<DailyProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const levelInfo = user ? getLevelInfoByXp(user.currentXp) : null;

  useEffect(() => {
    async function loadData() {
      try {
        const [progData, vocabData] = await Promise.all([
          getAllProgress(),
          getMyVocabularies(),
        ]);
        setAllProgress(progData);
        setVocabCount(vocabData.length);
      } catch (err) {
        console.error('Failed to load stats data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Build chart data from allProgress + fill missing days
    const days: DayData[] = [];
    const count = range === '7d' ? 7 : range === '30d' ? 30 : 60;

    for (let i = count - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const prog = allProgress.find((p) => {
        // Match by date string
        const pDate = typeof p.date === 'string' ? p.date.slice(0, 10) : format(new Date(p.date), 'yyyy-MM-dd');
        return pDate === dateStr;
      });
      days.push({
        date: dateStr,
        label: format(d, count === 7 ? 'EEE' : 'MMM d'),
        minutes: prog ? Math.round(prog.secondsSpoken / 60) : 0,
        xp: 0,
      });
    }
    setChartData(days);
  }, [range, allProgress, isLoading]);

  if (!user || !streak) return null;

  const totalMinutes = allProgress.reduce((s, p) => s + Math.floor(p.secondsSpoken / 60), 0);
  const activeDays = allProgress.filter((p) => p.secondsSpoken > 0).length;

  const stats = [
    { label: 'Total XP', value: formatXp(user.currentXp), icon: '✨', color: '#3a86ff' },
    { label: 'Total Minutes', value: `${totalMinutes}m`, icon: '🎙️', color: '#10b981' },
    { label: 'Saved Words', value: vocabCount, icon: '🔖', color: '#8b5cf6' },
    { label: 'Best Streak', value: `${streak.longestStreak}d`, icon: '🔥', color: '#f97316' },
  ];

  const RANGE_OPTS: { value: Range; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="px-0 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-10 space-y-5 animate-fade-in max-w-5xl mx-auto w-full">

      {/* ── Header ─────────────────────────────────── */}
      <div className="px-4 sm:px-0">
        <h1 className="font-display-md text-[var(--color-ink)]">Learning Stats</h1>
        <p className="text-[13px] text-[var(--color-ink-muted)] mt-1">
          Your English learning journey at a glance
        </p>
      </div>

      {/* ── Level badge ─────────────────────────────── */}
      {levelInfo && (
        <div className="mx-4 sm:mx-0">
          <div
            className="flex items-center gap-4 p-5 rounded-[var(--radius-xl)]"
            style={{
              background: `linear-gradient(135deg, ${levelInfo.color}18 0%, ${levelInfo.color}06 100%)`,
              border: `1px solid ${levelInfo.color}30`,
            }}
          >
            <div
              className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center text-3xl shrink-0"
              style={{ background: `${levelInfo.color}20`, border: `1.5px solid ${levelInfo.color}40` }}
            >
              {levelInfo.emoji}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Current Rank</p>
              <p className="text-[20px] font-black" style={{ color: levelInfo.color }}>{levelInfo.label}</p>
              <p className="text-[12px] text-[var(--color-ink-muted)]">
                {formatXp(user.currentXp)} · {levelInfo.xpNext - user.currentXp} XP to next rank
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 sm:px-0">
        {stats.map(({ label, value, icon, color }) => (
          <Card key={label} variant="default" padding="sm">
            <div className="text-center py-1">
              <span className="text-2xl block mb-2">{icon}</span>
              <p className="text-[18px] font-black leading-none" style={{ color }}>{value}</p>
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-1 font-medium">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Range selector ──────────────────────────── */}
      <div className="flex gap-2 px-4 sm:px-0">
        {RANGE_OPTS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setRange(value)}
            className={cn(
              'px-4 py-1.5 rounded-[var(--radius-sm)] text-[12px] font-semibold border transition-all duration-200',
              range === value
                ? 'bg-[var(--color-primary)] text-white border-transparent'
                : 'bg-[var(--color-surface-card)] text-[var(--color-ink-muted)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Minutes Spoken Chart ─────────────────────── */}
      <Card variant="default">
        <h2 className="text-[14px] font-semibold text-[var(--color-ink)] mb-4">🎙️ Minutes Spoken</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="chartPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
              axisLine={false}
              tickLine={false}
              interval={range === '30d' ? 4 : 0}
            />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-modal)',
                border: '1px solid var(--color-hairline)',
                borderRadius: '10px',
                fontSize: '12px',
                color: 'var(--color-ink)',
              }}
              formatter={(value) => [`${value ?? 0} min`, 'Speaking Time']}
              cursor={{ fill: 'rgba(58,134,255,0.06)' }}
            />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.minutes > 0 ? 'url(#chartPrimary)' : 'var(--color-surface-active)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Streak Calendar ─────────────────────────── */}
      <Card variant="default">
        <h2 className="text-[14px] font-semibold text-[var(--color-ink)] mb-4">🔥 Streak Overview</h2>
        <div className="flex gap-2 flex-wrap">
          {chartData.slice(-28).map((d, i) => {
            const active = d.minutes > 0;
            return (
              <div
                key={i}
                title={`${d.date}: ${d.minutes} min`}
                className="w-7 h-7 rounded-md transition-all"
                style={{
                  background: active
                    ? d.minutes >= 10
                      ? '#10b981'
                      : d.minutes >= 5
                      ? '#34d399'
                      : '#a7f3d0'
                    : 'var(--color-surface-active)',
                  border: '1px solid var(--color-hairline)',
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: '#10b981' }} />
            <span className="text-[11px] text-[var(--color-ink-muted)]">10+ min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: '#34d399' }} />
            <span className="text-[11px] text-[var(--color-ink-muted)]">5-9 min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: '#a7f3d0' }} />
            <span className="text-[11px] text-[var(--color-ink-muted)]">1-4 min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-surface-active)', border: '1px solid var(--color-hairline)' }} />
            <span className="text-[11px] text-[var(--color-ink-muted)]">No activity</span>
          </div>
        </div>
      </Card>

      {/* ── Weekly Summary Table ─────────────────────── */}
      <Card variant="default">
        <h2 className="text-[14px] font-semibold text-[var(--color-ink)] mb-4">📊 This Week Summary</h2>
        <div className="space-y-2">
          {chartData.slice(-7).reverse().map((d) => (
            <div key={d.date} className="flex items-center gap-3">
              <span className="text-[12px] text-[var(--color-ink-muted)] w-9 shrink-0">{d.label}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-active)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (d.minutes / 30) * 100)}%`,
                    background: d.minutes > 0 ? '#3a86ff' : 'transparent',
                  }}
                />
              </div>
              <span className="text-[12px] font-semibold text-[var(--color-ink)] w-12 text-right">
                {d.minutes > 0 ? `${d.minutes}m` : '–'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
