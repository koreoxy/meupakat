'use client';
// src/app/dashboard/layout.tsx
// Dashboard shell — persistent sidebar + header with auth guard

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/hooks/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils/cn';
import LevelUpModal from '@/components/features/LevelUpModal';
import ConfettiCelebration from '@/components/ui/ConfettiCelebration';
import MeupakatLogo from '@/components/ui/MeupakatLogo';
import NotificationBell from '@/components/features/NotificationBell';
import { useTranslation } from '@/hooks/useTranslation';

const NAV_ITEMS = [
  { href: '/dashboard',             label: 'Home',        icon: HomeIcon,        id: 'nav-home' },
  { href: '/dashboard/practice',    label: 'Practice',    icon: MicIcon,         id: 'nav-practice' },
  { href: '/dashboard/practice/materials', label: 'Speaking Cards', icon: CardIcon, id: 'nav-materials' },
  { href: '/dashboard/stats',       label: 'Stats',       icon: ChartIcon,       id: 'nav-stats' },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: TrophyIcon,      id: 'nav-leaderboard' },
  { href: '/dashboard/vocabulary',  label: 'Vocabulary',  icon: BookIcon,        id: 'nav-vocabulary' },
  { href: '/dashboard/profile',     label: 'Profile',     icon: UserIcon,        id: 'nav-profile' },
];

// Mobile nav shows 5 essential items (Home, Practice, Vocabulary, Leaderboard, Profile)
const MOBILE_NAV = [
  { href: '/dashboard',             label: 'Home',        icon: HomeIcon,        id: 'nav-home' },
  { href: '/dashboard/practice',    label: 'Practice',    icon: MicIcon,         id: 'nav-practice' },
  { href: '/dashboard/vocabulary',  label: 'Vocabulary',  icon: BookIcon,        id: 'nav-vocabulary' },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: TrophyIcon,      id: 'nav-leaderboard' },
  { href: '/dashboard/profile',     label: 'Profile',     icon: UserIcon,        id: 'nav-profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, didLevelUp, dismissLevelUp } = useAppStore();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t, language } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const [isPracticeOpen, setIsPracticeOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/practice')) {
      setIsPracticeOpen(true);
    }
  }, [pathname]);

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

  const isMissionPage = pathname.startsWith('/dashboard/mission/');

  if (isMissionPage) {
    return (
      <div className="h-dvh w-screen bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans overflow-hidden relative">
        {children}
        {didLevelUp && (
          <LevelUpModal xp={user.currentXp} onClose={dismissLevelUp} />
        )}
        <ConfettiCelebration />
      </div>
    );
  }

  const getTranslatedLabel = (href: string, fallback: string) => {
    switch (href) {
      case '/dashboard': return t('nav_home');
      case '/dashboard/practice': return t('nav_practice');
      case '/dashboard/practice/materials': return t('nav_materials');
      case '/dashboard/stats': return t('nav_stats');
      case '/dashboard/leaderboard': return t('nav_leaderboard');
      case '/dashboard/vocabulary': return t('nav_vocabulary');
      case '/dashboard/profile': return t('nav_profile');
      default: return fallback;
    }
  };

  return (
    <div className="h-dvh flex bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans overflow-hidden">

      {/* ── Sidebar (Desktop ≥ md) ─────────────────────────────────── */}
      <aside
        style={{ width: '220px' }}
        className="hidden md:flex flex-col shrink-0 h-full border-r border-[var(--color-hairline)] bg-[var(--color-surface-sidebar)]"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--color-hairline)] shrink-0">
          <MeupakatLogo size={28} />
          <span className="text-[15px] font-semibold text-[var(--color-ink)] tracking-[-0.01em]">
            Meupakat
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 px-3 pt-4 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] px-3 mb-2">
            Main
          </p>
          {NAV_ITEMS.map(({ href, label, icon: Icon, id }) => {
            // Skip rendering practice routes directly in NAV_ITEMS mapping
            if (href === '/dashboard/practice' || href === '/dashboard/practice/materials') {
              return null;
            }

            const isActive = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);
            const displayLabel = getTranslatedLabel(href, label);

            const renderLink = (
              <Link
                key={href}
                href={href}
                id={id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-[var(--color-surface-active)] text-[var(--color-ink)]'
                    : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-active)]'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {displayLabel}
              </Link>
            );

            // Insert Latihan Dropdown right after Home (/dashboard)
            if (href === '/dashboard') {
              const isAnyPracticeActive = pathname.startsWith('/dashboard/practice');
              return (
                <React.Fragment key={href}>
                  {renderLink}
                  
                  {/* Group: Latihan / Practice Dropdown */}
                  <div className="flex flex-col my-0.5">
                    <button
                      onClick={() => setIsPracticeOpen(prev => !prev)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors duration-150 w-full text-left',
                        isAnyPracticeActive
                          ? 'bg-[var(--color-surface-active)] text-[var(--color-ink)]'
                          : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-active)]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <MicIcon className="w-4 h-4 shrink-0" />
                        <span>{language === 'id' ? 'Latihan' : 'Practice'}</span>
                      </div>
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={cn("w-3.5 h-3.5 transition-transform duration-200 text-[var(--color-ink-muted)]", isPracticeOpen ? "rotate-180" : "")}
                      >
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </button>
                    
                    {isPracticeOpen && (
                      <div className="pl-6 flex flex-col gap-0.5 mt-1 border-l border-[var(--color-hairline)] ml-5">
                        <Link
                          href="/dashboard/practice"
                          id="nav-practice-scenarios"
                          className={cn(
                            'px-3 py-2 rounded-[var(--radius-sm)] text-[12px] font-medium transition-colors duration-150 block',
                            pathname === '/dashboard/practice'
                              ? 'bg-[var(--color-surface-active)] text-[var(--color-ink)]'
                              : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-active)]'
                          )}
                        >
                          {language === 'id' ? 'Skenario Percakapan' : 'Conversation Scenarios'}
                        </Link>
                        <Link
                          href="/dashboard/practice/materials"
                          id="nav-materials"
                          className={cn(
                            'px-3 py-2 rounded-[var(--radius-sm)] text-[12px] font-medium transition-colors duration-150 block',
                            pathname === '/dashboard/practice/materials'
                              ? 'bg-[var(--color-surface-active)] text-[var(--color-ink)]'
                              : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-active)]'
                          )}
                        >
                          {language === 'id' ? 'Kartu Speaking' : 'Speaking Cards'}
                        </Link>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            }

            return renderLink;
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
        <header className={cn("h-16 border-b border-[var(--color-hairline)] px-6 flex items-center justify-between shrink-0 bg-[var(--color-canvas)]", pathname === '/dashboard/practice/materials' && "hidden md:flex")}>
          {/* Mobile brand */}
          <div className="flex items-center gap-2 md:hidden">
            <MeupakatLogo size={24} />
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

            {/* 🔔 Notification Bell — sekarang functional! */}
            <NotificationBell />

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
      <nav className={cn("md:hidden fixed bottom-0 inset-x-0 z-50 bg-[var(--color-surface-sidebar)]/80 backdrop-blur-lg border-t border-[var(--color-hairline)] pb-safe", pathname === '/dashboard/practice/materials' && "hidden")}>
        <div className="flex items-center justify-around px-1 py-1">
          {MOBILE_NAV.map(({ href, label, icon: Icon, id }) => {
            const isActive = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);
            let displayLabel = getTranslatedLabel(href, label);
            
            // Shorten strings to fit mobile viewports nicely
            if (displayLabel === 'Papan Peringkat') displayLabel = 'Peringkat';
            if (displayLabel === 'Weekly Leaderboard') displayLabel = 'Leaderboard';
            if (displayLabel === 'Kamus & Kosakata') displayLabel = 'Kamus';
            if (displayLabel === 'Dictionary & Vocab') displayLabel = 'Kamus';
            
            return (
              <Link
                key={href}
                href={href}
                id={id}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-1 py-1 transition-all duration-200 flex-1 min-w-0 min-h-[48px] relative rounded-xl',
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink-secondary)]'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-full transition-all duration-200 flex items-center justify-center',
                  isActive ? 'bg-[var(--color-primary)]/10 scale-105' : 'hover:bg-[var(--color-surface-active)]/50'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9.5px] font-bold tracking-wide truncate w-full text-center leading-none mt-0.5">{displayLabel}</span>
                <span className={cn(
                  "w-1 h-1 rounded-full bg-[var(--color-primary)] mt-1 transition-all duration-200",
                  isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )} />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Level-up modal */}
      {didLevelUp && (
        <LevelUpModal xp={user.currentXp} onClose={dismissLevelUp} />
      )}

      {/* Confetti celebration */}
      <ConfettiCelebration />
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

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 3v18h18M7 16l4-4 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 2h12l1 5c0 3.866-3.134 7-7 7S5 10.866 5 7L6 2zM9 21v-3M15 21v-3M7 21h10M3 4h3M21 4h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" fill="none" />
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

function CardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
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
