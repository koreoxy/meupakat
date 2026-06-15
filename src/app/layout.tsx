// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/hooks/useAppStore';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/hooks/useTheme';

export const metadata: Metadata = {
  title: 'Meupakat — Belajar Speaking English',
  description:
    'Aplikasi belajar speaking English yang interaktif dan menyenangkan. Latih percakapan harian dengan AI, bangun kebiasaan belajar dengan Daily Streak, dan tingkatkan level kemampuan berbahasa Inggrismu.',
  keywords: ['belajar bahasa inggris', 'speaking english', 'latihan percakapan', 'meupakat'],
  authors: [{ name: 'Meupakat Team' }],
  openGraph: {
    title: 'Meupakat — Belajar Speaking English',
    description: 'Latih speaking English setiap hari dengan AI.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#121314',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
        />
      </head>
      <body className="min-h-dvh bg-[var(--color-canvas)] text-[var(--color-ink)]">
        <ToastProvider>
          <ThemeProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
