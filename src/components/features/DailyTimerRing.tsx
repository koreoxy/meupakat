'use client';
// src/components/features/DailyTimerRing.tsx
// Circular SVG progress ring — CSS-var aware for dark/light mode

import { cn } from '@/lib/utils/cn';
import { formatDuration } from '@/lib/utils/streak';

interface DailyTimerRingProps {
  elapsedSeconds: number;
  targetSeconds: number;
  isActive?: boolean;
  size?: number;
  className?: string;
}

const RADIUS       = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DailyTimerRing({
  elapsedSeconds,
  targetSeconds,
  isActive = false,
  size = 120,
  className,
}: DailyTimerRingProps) {
  const percent    = Math.min(1, elapsedSeconds / targetSeconds);
  const offset     = CIRCUMFERENCE * (1 - percent);
  const isComplete = percent >= 1;

  const ringColor  = isComplete ? '#10b981' : isActive ? '#3a86ff' : 'var(--color-hairline)';
  const glowColor  = isComplete ? 'rgba(16,185,129,0.6)' : 'rgba(58,134,255,0.5)';
  const trackColor = 'var(--color-progress-bg)';

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={cn(
          'transition-all duration-500',
          isActive && !isComplete && 'drop-shadow-[0_0_8px_rgba(58,134,255,0.4)]',
          isComplete && 'drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]'
        )}
      >
        {/* Track ring */}
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke={trackColor} strokeWidth="8" />
        {/* Progress ring */}
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke={ringColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{
            transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
            filter: (isActive || isComplete) ? `drop-shadow(0 0 6px ${glowColor})` : 'none',
          }}
        />
        {/* Animated dot */}
        {isActive && !isComplete && (
          <circle
            cx={50 + RADIUS * Math.cos((2 * Math.PI * percent) - Math.PI / 2)}
            cy={50 + RADIUS * Math.sin((2 * Math.PI * percent) - Math.PI / 2)}
            r="4"
            fill="#3a86ff"
            style={{ filter: 'drop-shadow(0 0 4px rgba(58,134,255,1))' }}
          />
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isComplete ? (
          <>
            <span className="text-2xl mb-0.5">✅</span>
            <span className="text-xs font-bold text-[var(--color-success)]">Done!</span>
          </>
        ) : (
          <>
            <span
              className={cn('font-bold tabular-nums leading-none', size >= 100 ? 'text-xl' : 'text-base')}
              style={{ color: isActive ? '#3a86ff' : 'var(--color-ink-secondary)' }}
            >
              {formatDuration(elapsedSeconds)}
            </span>
            <span className="text-xs text-[var(--color-ink-muted)] mt-0.5">
              / {Math.round(targetSeconds / 60)}m
            </span>
          </>
        )}
      </div>
    </div>
  );
}
