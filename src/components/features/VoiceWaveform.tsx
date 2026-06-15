'use client';
// src/components/features/VoiceWaveform.tsx
// Animated waveform visualization while AI is speaking or user is recording

import { cn } from '@/lib/utils/cn';

interface VoiceWaveformProps {
  isActive: boolean;
  type?: 'ai' | 'user';
  barCount?: number;
  className?: string;
}

/** Animated SVG-based voice waveform with staggered bar animations */
export default function VoiceWaveform({
  isActive,
  type = 'ai',
  barCount = 7,
  className,
}: VoiceWaveformProps) {
  const color = type === 'ai' ? '#0ea5e9' : '#10b981';
  const glowColor = type === 'ai' ? 'rgba(14,165,233,0.6)' : 'rgba(16,185,129,0.6)';

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      aria-label={isActive ? `${type === 'ai' ? 'AI' : 'You'} are speaking` : 'Idle'}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const delay = (i * (0.8 / barCount)).toFixed(2);
        // Pattern: tall bars in the middle
        const baseHeight = i === Math.floor(barCount / 2) ? 24 : i % 2 === 0 ? 16 : 20;

        return (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: 3,
              height: isActive ? undefined : 4,
              minHeight: 4,
              maxHeight: 28,
              backgroundColor: isActive ? color : 'var(--color-hairline)',
              filter: isActive ? `drop-shadow(0 0 3px ${glowColor})` : 'none',
              animation: isActive
                ? `wave-bar 0.8s ease-in-out ${delay}s infinite alternate`
                : 'none',
              '--base-height': `${baseHeight}px`,
            } as React.CSSProperties}
          />
        );
      })}

      <style>{`
        @keyframes wave-bar {
          0% { height: 4px; }
          100% { height: var(--base-height, 20px); }
        }
      `}</style>
    </div>
  );
}
