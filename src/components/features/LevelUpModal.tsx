'use client';
// src/components/features/LevelUpModal.tsx
// Celebratory modal — DESIGN.md: modal-overlay surface + rounded.xl

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import Button from '@/components/ui/Button';
import { getLevelInfoByXp } from '@/lib/utils/xp';

interface LevelUpModalProps {
  xp: number;
  onClose: () => void;
}

export default function LevelUpModal({ xp, onClose }: LevelUpModalProps) {
  const [visible,  setVisible]  = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; delay: number }[]>([]);
  const levelInfo = getLevelInfoByXp(xp);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const colors = ['#3a86ff', '#10b981', '#f97316', '#8b5cf6', '#f43f5e', '#facc15'];
    setConfetti(
      Array.from({ length: 20 }, (_, i) => ({
        id:    i,
        x:     Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
      }))
    );
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9998] flex items-center justify-center p-4',
        'transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0'
      )}
      style={{ backgroundColor: 'var(--color-scrim)', backdropFilter: 'blur(6px)' }}
      onClick={handleClose}
    >
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute w-2 h-2 rounded-sm"
            style={{
              left:            `${c.x}%`,
              top:             '-8px',
              backgroundColor: c.color,
              animation:       `confetti-fall 2.5s ease-in ${c.delay}s forwards`,
            }}
          />
        ))}
      </div>

      {/* Modal card */}
      <div
        className={cn(
          'relative flex flex-col items-center text-center max-w-xs w-full',
          'rounded-[var(--radius-xl)] p-8',
          'transition-all duration-500',
          visible ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-8 opacity-0'
        )}
        style={{
          backgroundColor: 'var(--color-surface-modal)',
          border:          '1px solid var(--color-hairline)',
          boxShadow:       '0 24px 80px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow blob */}
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full opacity-15 blur-3xl -z-10 pointer-events-none"
          style={{ backgroundColor: levelInfo.color }}
        />

        {/* Level badge */}
        <div
          className="text-6xl mb-3 animate-scale-in"
          style={{ filter: `drop-shadow(0 0 20px ${levelInfo.color}80)` }}
        >
          {levelInfo.emoji}
        </div>

        <div
          className="text-[11px] font-bold uppercase tracking-[0.1em] mb-2"
          style={{ color: levelInfo.color }}
        >
          Level Up!
        </div>

        <h2 className="text-[22px] font-semibold text-[var(--color-ink)] tracking-[-0.01em] mb-1">
          You reached
        </h2>
        <h3
          className="text-[26px] font-black mb-4 tracking-[-0.02em]"
          style={{ color: levelInfo.color }}
        >
          {levelInfo.label}
        </h3>

        <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed mb-8">
          Amazing work! Keep practicing to unlock harder scenarios and earn more XP! 🚀
        </p>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleClose}
          id="level-up-continue-btn"
        >
          🎉 Continue Learning
        </Button>
      </div>
    </div>
  );
}
