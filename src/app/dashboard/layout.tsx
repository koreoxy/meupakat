'use client';
// src/app/dashboard/layout.tsx
// Dashboard shell — persistent sidebar + header with auth guard

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils/cn';
import LevelUpModal from '@/components/features/LevelUpModal';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: HomeIcon, id: 'nav-home' },
  { href: '/dashboard/practice', label: 'Practice', icon: MicIcon, id: 'nav-practice' },
  { href: '/dashboard/profile', label: 'Profile', icon: UserIcon, id: 'nav-profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, didLevelUp, dismissLevelUp } = useAppStore();
  const { theme, toggleTheme, isDark } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-dvh bg-[var(--color-canvas)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-dvh flex bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans overflow-hidden">

      {/* ── Sidebar (Desktop ≥ md) ─────────────────────────────────── */}
      <aside
        style={{ width: '260px' }}
        className="hidden md:flex flex-col shrink-0 h-full border-r border-[var(--color-hairline)] bg-[var(--color-surface-sidebar)]"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--color-hairline)] shrink-0">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-primary)] font-black text-sm shrink-0">
            M
          </div>
          <span className="text-[15px] font-semibold text-[var(--color-ink)] tracking-[-0.01em]">
            Meupakat
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-3 pt-5 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] px-3 mb-2">
            Main
          </p>
          {NAV_ITEMS.map(({ href, label, icon: Icon, id }) => {
            const isActive = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                id={id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-[14px] font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-[var(--color-surface-active)] text-[var(--color-ink)]'
                    : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-active)]'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User chip at bottom */}
        <div className="px-3 py-4 border-t border-[var(--color-hairline)] shrink-0">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-active)] transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.fullName ? user.fullName[0].toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[var(--color-ink)] truncate leading-tight">
                {user.fullName || 'Guest'}
              </p>
              <p className="text-[11px] text-[var(--color-ink-muted)] truncate leading-tight">
                {user.email}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* Top Header */}
        <header className="h-16 border-b border-[var(--color-hairline)] px-6 flex items-center justify-between shrink-0 bg-[var(--color-canvas)]">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-[var(--radius-xs)] bg-[var(--color-primary)] flex items-center justify-center text-white font-black text-xs">
              M
            </div>
            <span className="text-[15px] font-semibold text-[var(--color-ink)]">Meupakat</span>
          </div>
          {/* Page title slot — hidden mobile */}
          <div className="hidden md:block" />

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
              className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-surface-card)] border border-[var(--color-hairline)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-muted)] transition-colors"
            >
              {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>

            <button
              aria-label="Notifications"
              className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-surface-card)] border border-[var(--color-hairline)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-muted)] transition-colors relative"
            >
              <BellIcon className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full" />
            </button>

            {/* Avatar (desktop) */}
            <Link
              href="/dashboard/profile"
              className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)] hover:border-[var(--color-ink-muted)] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {user.fullName ? user.fullName[0].toUpperCase() : '?'}
              </div>
              <span className="text-[13px] font-medium text-[var(--color-ink)]">
                {user.fullName?.split(' ')[0] || 'Guest'}
              </span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom bar ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[var(--color-surface-sidebar)] border-t border-[var(--color-hairline)] pb-safe">
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, id }) => {
            const isActive = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                id={id}
                className={cn(
                  'flex flex-col items-center gap-1 px-5 py-2 rounded-[var(--radius-sm)] transition-colors duration-150',
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink-secondary)]'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Level-up modal */}
      {didLevelUp && (
        <LevelUpModal xp={user.currentXp} onClose={dismissLevelUp} />
      )}
    </div>
  );
}

/* ── Icon primitives ─────────────────────────────────────────────── */
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10.707 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 19 11h-1v9a1 1 0 0 1-1 1h-4v-5H11v5H7a1 1 0 0 1-1-1v-9H5a1 1 0 0 1-.707-1.707l7-7z" />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
      <path d="M19 10a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.07A7 7 0 0 0 19 10z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-1.33-2.67-4-8-4z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a7 7 0 0 0-7 7v4l-1.7 1.7A1 1 0 0 0 4 16h16a1 1 0 0 0 .7-1.7L19 13V9a7 7 0 0 0-7-7zm0 20a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
