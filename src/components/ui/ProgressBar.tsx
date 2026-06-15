'use client';
// src/components/ui/ProgressBar.tsx

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  variant?: 'brand' | 'accent' | 'xp' | 'streak';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const variantColors: Record<string, string> = {
  brand:  '#3a86ff',
  accent: '#10b981',
  xp:     '#8b5cf6',
  streak: '#ff8000',
};

const sizeHeights: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

/** Animated progress bar with gradient fill */
export default function ProgressBar({
  value,
  variant = 'brand',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className,
}: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const clamped = Math.min(100, Math.max(0, value));

  useEffect(() => {
    if (!fillRef.current) return;
    // Animate width with requestAnimationFrame for smoothness
    const el = fillRef.current;
    el.style.transition = animated ? 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
    el.style.width = `${clamped}%`;
  }, [clamped, animated]);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-[12px] text-[var(--color-ink-muted)] font-medium">{label}</span>}
          {showLabel && (
            <span className="text-[12px] font-bold text-[var(--color-ink-secondary)]">{clamped}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-[var(--radius-full)] overflow-hidden',
          sizeHeights[size]
        )}
        style={{ backgroundColor: 'var(--color-progress-bg)' }}
      >
        <div
          ref={fillRef}
          className="h-full rounded-[var(--radius-full)] relative overflow-hidden"
          style={{
            width: '0%',
            backgroundColor: variantColors[variant],
          }}
        >
          {/* Shimmer effect */}
          {animated && (
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
