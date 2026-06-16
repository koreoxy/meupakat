'use client';
// src/app/login/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/hooks/useAppStore';
import Button from '@/components/ui/Button';
import { loginWithEmail, loginWithGoogle } from '@/app/actions/auth';
import MeupakatLogo from '@/components/ui/MeupakatLogo';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshData } = useAppStore();

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setError('');
    const res = await loginWithEmail(email, password);
    if (!res.success) {
      setError(res.error || 'Login failed.');
      setIsLoading(false);
      return;
    }
    await refreshData();
    router.replace('/dashboard');
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    const res = await loginWithGoogle();
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      setError(res.error || 'Google login failed.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[var(--color-canvas)] flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden">

      {/* Subtle glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3a86ff 0%, transparent 70%)' }}
      />

      {/* Back link */}
      <div className="absolute top-5 left-5">
        <Link
          href="/"
          className="text-[13px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors flex items-center gap-1"
        >
          ← Back
        </Link>
      </div>

      <div className="w-full max-w-sm animate-fade-in-up relative">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <MeupakatLogo size={28} />
          <span className="text-[18px] font-semibold text-[var(--color-ink)] tracking-[-0.01em]">
            Meupakat
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-[22px] font-semibold text-[var(--color-ink)] text-center tracking-[-0.01em] mb-1">
          Welcome Back!
        </h1>
        <p className="text-[13px] text-[var(--color-ink-muted)] text-center mb-8">
          Lanjutkan streak belajarmu 🔥
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label
              htmlFor="login-email"
              className="block text-[11px] font-semibold text-[var(--color-ink-muted)] mb-1.5 uppercase tracking-[0.05em]"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="email@kamu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-disabled)] text-[13px] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-[11px] font-semibold text-[var(--color-ink-muted)] mb-1.5 uppercase tracking-[0.05em]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-disabled)] text-[13px] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors focus:outline-none flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[var(--color-error)] text-[12px] text-center animate-fade-in">{error}</p>
          )}

          <Button id="login-submit-btn" type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
            Login →
          </Button>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-[var(--color-hairline)]" />
            <span className="flex-shrink-0 mx-4 text-[var(--color-ink-muted)] text-[11px]">Atau</span>
            <div className="flex-grow border-t border-[var(--color-hairline)]" />
          </div>

          <Button
            id="google-login-btn"
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon />
            Lanjutkan dengan Google
          </Button>
        </form>

        <p className="text-center text-[var(--color-ink-muted)] text-[12px] mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-[var(--color-primary)] hover:underline font-semibold">
            Daftar Gratis
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
