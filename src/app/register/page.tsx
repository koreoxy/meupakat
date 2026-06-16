'use client';
// src/app/register/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/hooks/useAppStore';
import Button from '@/components/ui/Button';
import type { UserLevel } from '@/types';
import { registerWithEmail, loginWithGoogle } from '@/app/actions/auth';
import MeupakatLogo from '@/components/ui/MeupakatLogo';
import { Eye, EyeOff } from 'lucide-react';

const LEVELS: { value: UserLevel; label: string; desc: string; emoji: string; color: string }[] = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Percakapan sehari-hari & perkenalan dasar', emoji: '🌱', color: '#10b981' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Presentasi kerja & meeting profesional',      emoji: '🚀', color: '#3a86ff' },
  { value: 'advanced',     label: 'Advanced',     desc: 'Negosiasi bisnis & pitch startup',            emoji: '⚡', color: '#8b5cf6' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { refreshData } = useAppStore();

  const [step,           setStep]           = useState<1 | 2>(1);
  const [fullName,       setFullName]       = useState('');
  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [showPassword,   setShowPassword]   = useState(false);
  const [selectedLevel,  setSelectedLevel]  = useState<UserLevel>('beginner');
  const [isLoading,      setIsLoading]      = useState(false);
  const [error,          setError]          = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');
    const res = await registerWithEmail(fullName, email, password, selectedLevel);
    if (!res.success) {
      setError(res.error || 'Pendaftaran gagal. Silakan coba lagi.');
      setIsLoading(false);
      return;
    }
    if (res.requiresEmailConfirmation) {
      setSuccessMessage('Silakan cek email kamu untuk konfirmasi pendaftaran!');
      setIsLoading(false);
      return;
    }
    await refreshData();
    router.replace('/dashboard');
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError('');
    const res = await loginWithGoogle();
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      setError(res.error || 'Google sign-up failed.');
      setIsLoading(false);
    }
  };

  /* shared label style */
  const labelCls = 'block text-[11px] font-semibold text-[var(--color-ink-muted)] mb-1.5 uppercase tracking-[0.05em]';
  const inputCls = 'w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-disabled)] text-[13px] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all';

  return (
    <main className="min-h-dvh bg-[var(--color-canvas)] flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden">

      {/* Subtle glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3a86ff 0%, transparent 70%)' }}
      />

      {/* Back */}
      <div className="absolute top-5 left-5">
        {step === 1 ? (
          <Link href="/" className="text-[13px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors flex items-center gap-1">
            ← Back
          </Link>
        ) : (
          <button onClick={() => setStep(1)} className="text-[13px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors flex items-center gap-1">
            ← Back
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 relative">
        {[1, 2].map((s) => (
          <div
            key={s}
            className="flex items-center gap-2"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
              style={{
                backgroundColor: step >= s ? 'var(--color-primary)' : 'var(--color-surface-active)',
                color: step >= s ? 'white' : 'var(--color-ink-muted)',
              }}
            >
              {s}
            </div>
            {s < 2 && (
              <div
                className="w-8 h-px"
                style={{ backgroundColor: step > 1 ? 'var(--color-primary)' : 'var(--color-hairline)' }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm animate-fade-in-up relative">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <MeupakatLogo size={28} />
          <span className="text-[18px] font-semibold text-[var(--color-ink)] tracking-[-0.01em]">
            Meupakat
          </span>
        </div>

        {/* ── Success state ─── */}
        {successMessage ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-[22px] font-semibold text-[var(--color-ink)] tracking-[-0.01em] mb-2">
              Cek Email Kamu
            </h1>
            <p className="text-[13px] text-[var(--color-ink-muted)]">{successMessage}</p>
          </div>

        /* ── Step 1: Credentials ─── */
        ) : step === 1 ? (
          <>
            <h1 className="text-[22px] font-semibold text-[var(--color-ink)] tracking-[-0.01em] text-center mb-1">
              Buat Akun
            </h1>
            <p className="text-[13px] text-[var(--color-ink-muted)] text-center mb-8">
              Mulai perjalanan belajarmu hari ini
            </p>

            <form onSubmit={handleStep1} className="space-y-3">
              <div>
                <label htmlFor="fullName" className={labelCls}>Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="email" className={labelCls}>Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="budi@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="password" className={labelCls}>Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Minimal 6 karakter"
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

              <Button id="continue-register-btn" type="submit" variant="primary" size="lg" fullWidth>
                Lanjut →
              </Button>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-[var(--color-hairline)]" />
                <span className="flex-shrink-0 mx-4 text-[var(--color-ink-muted)] text-[11px]">Atau</span>
                <div className="flex-grow border-t border-[var(--color-hairline)]" />
              </div>

              <Button
                id="google-register-btn"
                type="button"
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleGoogleRegister}
                disabled={isLoading}
              >
                <GoogleIcon />
                Daftar dengan Google
              </Button>
            </form>
          </>

        /* ── Step 2: Level selection ─── */
        ) : (
          <>
            <h1 className="text-[22px] font-semibold text-[var(--color-ink)] tracking-[-0.01em] text-center mb-1">
              Pilih Level Kamu
            </h1>
            <p className="text-[13px] text-[var(--color-ink-muted)] text-center mb-6">
              Jangan khawatir, kamu bisa ubah nanti
            </p>

            <div className="space-y-2 mb-6">
              {LEVELS.map((lvl) => {
                const isSelected = selectedLevel === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    id={`level-${lvl.value}-btn`}
                    onClick={() => setSelectedLevel(lvl.value)}
                    className="w-full p-4 rounded-[var(--radius-md)] border text-left transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? `${lvl.color}12` : 'var(--color-surface-card)',
                      borderColor:     isSelected ? lvl.color          : 'var(--color-hairline)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lvl.emoji}</span>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-[var(--color-ink)]">{lvl.label}</p>
                        <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">{lvl.desc}</p>
                      </div>
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white animate-scale-in shrink-0"
                          style={{ backgroundColor: lvl.color }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-[var(--color-error)] text-[12px] text-center animate-fade-in mb-4">{error}</p>
            )}

            <Button
              id="finish-register-btn"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              onClick={handleRegister}
            >
              🚀 Mulai Belajar!
            </Button>
          </>
        )}

        {!successMessage && step === 1 && (
          <p className="text-center text-[var(--color-ink-muted)] text-[12px] mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-[var(--color-primary)] hover:underline font-semibold">
              Login
            </Link>
          </p>
        )}
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
