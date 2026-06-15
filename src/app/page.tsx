'use client';
// src/app/page.tsx — Landing / Auth Gate

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/hooks/useAppStore';
import Link from 'next/link';

const FEATURES = [
  { icon: '🤖', label: 'AI Voice' },
  { icon: '🔥', label: 'Daily Streak' },
  { icon: '⚡', label: 'XP System' },
  { icon: '🎯', label: 'Real Scenarios' },
];

export default function RootPage() {
  const { user, isLoading } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[var(--color-canvas)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <main className="min-h-dvh bg-[var(--color-canvas)] flex flex-col items-center justify-center px-5 py-16 relative overflow-hidden">

      {/* Subtle glow backdrop */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3a86ff 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-sm relative">

        {/* ── Logo ───────────────────────────────────── */}
        <div className="flex items-center gap-3 justify-center mb-10 animate-fade-in-down">
          <div
            className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center text-xl font-black bg-[var(--color-primary)] text-[var(--color-on-primary)]"
          >
            M
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--color-ink)] leading-tight tracking-[-0.01em]">
              Meupakat
            </h1>
            <p className="text-[12px] text-[var(--color-ink-muted)] font-medium">Speak English. Every Day.</p>
          </div>
        </div>

        {/* ── Hero ───────────────────────────────────── */}
        <div className="text-center animate-fade-in-up">
          <div className="text-5xl mb-5 animate-float">🎙️</div>
          <h2 className="text-[22px] font-semibold text-[var(--color-ink)] leading-[1.3] tracking-[-0.01em] mb-3">
            Belajar Speaking English<br />
            <span className="text-[var(--color-primary)]">Setiap Hari, 10 Menit</span>
          </h2>
          <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed mb-8 max-w-xs mx-auto">
            Latihan percakapan interaktif dengan AI, skenario nyata, streak harian, dan sistem XP yang membuat belajar jadi menyenangkan!
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {FEATURES.map((f) => (
              <span
                key={f.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)] text-[12px] font-semibold bg-[var(--color-surface-card)] border border-[var(--color-hairline)] text-[var(--color-ink-secondary)]"
              >
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/register"
              id="get-started-btn"
              className="w-full h-11 flex items-center justify-center rounded-[var(--radius-sm)] text-[14px] font-semibold text-[var(--color-on-primary)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors ripple"
            >
              Mulai Gratis →
            </Link>
            <Link
              href="/login"
              id="login-link"
              className="w-full h-11 flex items-center justify-center rounded-[var(--radius-sm)] text-[14px] font-medium text-[var(--color-ink-secondary)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)] hover:border-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              Sudah punya akun? Login
            </Link>
          </div>

          <p className="text-[var(--color-ink-muted)] text-[11px] mt-6">
            Gratis selamanya · Tidak perlu kartu kredit
          </p>
        </div>
      </div>
    </main>
  );
}
