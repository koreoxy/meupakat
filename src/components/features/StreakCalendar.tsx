'use client';
// src/components/features/StreakCalendar.tsx
// Mini 7-day streak calendar — dark DESIGN.md tokens

import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import type { DailyProgress } from '@/types';
import { getPastNDays, isDayCompleted } from '@/lib/utils/streak';

interface StreakCalendarProps {
  weeklyProgress: DailyProgress[];
  targetMinutes: number;
  className?: string;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function StreakCalendar({
  weeklyProgress,
  targetMinutes,
  className,
}: StreakCalendarProps) {
  const last7Days = getPastNDays(7);
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className={cn('flex gap-1.5 items-end justify-between', className)}>
      {last7Days.map((dateStr, idx) => {
        const isToday  = dateStr === today;
        const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay();
        const dayLabel  = DAY_LABELS[dayOfWeek];
        const completed = isDayCompleted(dateStr, weeklyProgress, targetMinutes);
        const isPast    = dateStr < today;

        return (
          <div key={dateStr} className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-[10px] text-[var(--color-ink-muted)] font-semibold uppercase">
              {dayLabel}
            </span>

            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center relative transition-all duration-300',
                completed
                  ? ''
                  : isToday
                  ? 'border-2 border-[var(--color-primary)]'
                  : isPast
                  ? 'bg-[var(--color-surface-active)] border border-[var(--color-hairline)]'
                  : 'bg-[var(--color-surface-card)] border border-[var(--color-hairline-soft)]'
              )}
              style={completed ? {
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                boxShadow: '0 0 10px rgba(249,115,22,0.4)',
              } : isToday ? {
                backgroundColor: 'rgba(58,134,255,0.1)',
              } : {}}
            >
              {completed ? (
                <span
                  className="text-sm animate-streak-fire"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  🔥
                </span>
              ) : isToday ? (
                <span className="text-[11px] font-bold text-[var(--color-primary)]">
                  {new Date().getDate()}
                </span>
              ) : isPast ? (
                <span className="text-[11px] text-[var(--color-ink-disabled)]">✗</span>
              ) : (
                <span className="text-[11px] text-[var(--color-ink-muted)]">
                  {new Date(dateStr + 'T12:00:00').getDate()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
