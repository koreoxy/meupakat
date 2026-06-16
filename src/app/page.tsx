"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/hooks/useAppStore";
import { useTheme } from "@/hooks/useTheme";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Send,
  Star,
  Sparkles,
  Sun,
  Moon,
  Download,
  X,
} from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

const RobotIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--color-ink-secondary)]"
  >
    <path d="M5,6 C4,6.5 4,16.5 5,17 C6,17.5 18,17.5 19,17 C20,16.5 20,6.5 19,6 C18,5.5 6,5.5 5,6 Z" />
    <circle cx="9" cy="11" r="1.2" fill="currentColor" />
    <circle cx="15" cy="11" r="1.2" fill="currentColor" />
    <path d="M10,14 C11,15 13,15 14,14" />
    <path d="M12,5.5 L12,3" />
    <circle cx="12" cy="2" r="1" />
  </svg>
);

const FireIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--color-ink-secondary)]"
  >
    <path d="M12,2 C12,2 15,6 16,9 C17,12 17,16 14,18.5 C12,20 8.5,19 7,16 C5.5,13 6,9.5 9,6.5 C10,5.5 11,3.5 12,2 Z" />
    <path d="M12,8 C12,8 13.5,10.5 13.5,12 C13.5,13.5 12,15 11,15.5 C10,16 9,15 8.5,13.5 C8,12 9,10.5 11.5,9 C11.8,8.7 12,8 12,8 Z" />
  </svg>
);

const LightningIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--color-ink-secondary)]"
  >
    <path d="M13,2 L5,13 L11.5,13 L9.5,22 L19,10.5 L12.5,10.5 L13,2 Z" />
  </svg>
);

const TargetIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--color-ink-secondary)]"
  >
    <path d="M12,3 C17,3.2 20.8,7 21,12 C20.8,17 17,20.8 12,21 C7,20.8 3.2,17 3,12 C3.2,7 7,3.2 12,3 Z" />
    <path d="M12,7.5 C14.5,7.7 16.3,9.5 16.5,12 C16.3,14.5 14.5,16.3 12,16.5 C9.5,16.3 7.7,14.5 7.5,12 C7.7,9.5 9.5,7.7 12,7.5 Z" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <path d="M12,1 L12,4" />
    <path d="M12,20 L12,23" />
    <path d="M1,12 L4,12" />
    <path d="M20,12 L23,12" />
  </svg>
);

const MeupakatLogoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="28"
    height="28"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-[var(--color-primary)]"
  >
    <path d="M21 11.5c0 4.5-4.5 8-9 8c-1.8 0-3.5-1-5-2L3 19.5l1.8-4.2C3.8 14 3.2 12.5 3.2 11.5c0-4.5 4.3-8.3 8.8-8.3c4.5 0 9 3.8 9 8.3z" />
    <path d="M8.5 14.5V9l3.5 3l3.5-3v5.5" />
  </svg>
);

const FEATURES = [
  { icon: <RobotIcon />, label: "AI Voice Tutor" },
  { icon: <FireIcon />, label: "Daily Streak" },
  { icon: <LightningIcon />, label: "XP & Level Ranks" },
  { icon: <TargetIcon />, label: "Real Scenario Grid" },
];

export default function RootPage() {
  const { user, isLoading } = useAppStore();
  const { theme, toggleTheme, isDark } = useTheme();
  const router = useRouter();

  const { isInstallable, isInstalled, isMobile, triggerInstall } = usePWA();
  const [isBannerDismissed, setIsBannerDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("meupakat-pwa-dismissed") === "true";
    setIsBannerDismissed(dismissed);
  }, []);

  const dismissBanner = () => {
    localStorage.setItem("meupakat-pwa-dismissed", "true");
    setIsBannerDismissed(true);
  };

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
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
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] relative overflow-hidden font-sans flex flex-col justify-between transition-colors duration-300">
      {/* Background Subtle Mesh Gradient */}
      <div
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, transparent 80%)",
        }}
      />
      <div
        className="absolute bottom-[-100px] right-[10%] w-[500px] h-[500px] rounded-full opacity-5 pointer-events-none blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-secondary-purple) 0%, transparent 80%)",
        }}
      />

      {/* ── HEADER ───────────────────────────────────── */}
      <header className="max-w-7xl mx-auto w-full px-5 py-5 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <MeupakatLogoIcon />
          <div>
            <h1 className="text-[18px] font-bold text-[var(--color-ink)] leading-tight tracking-tight">
              Meupakat
            </h1>
            <p className="text-[10px] text-[var(--color-ink-muted)] font-medium">
              Learn Speaking. Every Day.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border border-[var(--color-hairline)] flex items-center justify-center text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)] transition-all mr-2"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </motion.button>

          {/* Social Icons */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full border border-[var(--color-hairline)] flex items-center justify-center text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-soft)] transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
              >
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full border border-[var(--color-hairline)] flex items-center justify-center text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-soft)] transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full border border-[var(--color-hairline)] flex items-center justify-center text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-soft)] transition-colors"
            >
              <Send size={14} />
            </motion.a>
          </div>

          <Link
            href="/login"
            className="px-4 py-2 border border-[var(--color-hairline)] hover:border-[var(--color-ink-muted)] rounded-full text-[12px] font-semibold text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] bg-[var(--color-surface-card)] transition-all shadow-sm"
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* ── MAIN HERO LAYOUT ─────────────────────────── */}
      <main className="max-w-7xl mx-auto w-full px-5 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center z-10 relative flex-1">
        {/* Kolom Kiri: Headline, Deskripsi, dan CTA */}
        <div className="lg:col-span-5 space-y-6 lg:text-left text-center flex flex-col lg:items-start items-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
            Online Speaking Sandbox
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[32px] sm:text-[44px] lg:text-[48px] font-black leading-[1.15] tracking-tight text-[var(--color-ink)]"
          >
            Push level bicara
            <br />
            <span className="text-[var(--color-primary)]">
              bahasa Inggris-mu.
            </span>{" "}
            <br />
            Mainkan misinya, kuasai bahasanya.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[13px] sm:text-[14px] text-[var(--color-ink-muted)] leading-relaxed max-w-md"
          >
            Latih percakapan interaktif privat bersama AI Tutor. Dilengkapi
            skenario kehidupan sehari-hari, koreksi tata bahasa langsung, dan
            sistem XP yang menyenangkan.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 pt-3 w-full sm:w-auto"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/register"
                className="h-12 px-8 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] font-semibold rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                Mulai Latihan Gratis
                <ArrowUpRight size={16} />
              </Link>
            </motion.div>

            {isInstallable && !isInstalled && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <button
                  onClick={triggerInstall}
                  className="h-12 px-8 border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 font-semibold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Download size={16} />
                  Instal Aplikasi
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-2 justify-center lg:justify-start pt-6 border-t border-[var(--color-hairline)] w-full"
          >
            {FEATURES.map((f) => (
              <span
                key={f.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink-secondary)]"
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Kolom Tengah: Doodle Art Animasi */}
        <div className="lg:col-span-4 flex justify-center relative my-10 lg:my-0">
          {/* Hand-drawn Hey! badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -5 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="absolute top-5 left-5 bg-[#e45858] text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-md rotate-[-5deg] z-20 select-none cursor-default"
          >
            Hello! 💬
          </motion.div>

          {/* Hand-drawn flexible schedule bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 8 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="absolute bottom-16 right-0 bg-[var(--color-secondary-purple)] text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-md rotate-[8deg] z-20 select-none cursor-default"
          >
            Let&apos;s speak! 🚀
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary-purple)] opacity-10 rounded-full blur-2xl z-0" />
            <img
              src="/images/mascot_reading_guitar.png"
              alt="Mascot Meupakat Sitting"
              className="w-full h-full object-contain z-10 select-none cursor-pointer filter drop-shadow-md"
            />
          </motion.div>
        </div>

        {/* Kolom Kanan: Tes Penempatan Kustom dengan Speech Bubble & Chamfered Button */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-center w-full">
          {/* Card Kuis Penempatan dengan Speech Bubble Tail */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 bg-[#10b981] text-white rounded-2xl space-y-4 shadow-md relative overflow-visible group hover:bg-[#0ea5e9] transition-all duration-300
                       after:content-[''] after:absolute after:bottom-[-6px] after:left-12 after:w-3 after:h-3 after:bg-inherit after:rotate-45 after:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-white" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-100">
                Rekomendasi
              </span>
            </div>

            <h3 className="font-bold text-[16px] leading-snug">
              Ragu dengan level Anda?
            </h3>

            <p className="text-[12px] text-emerald-55 leading-relaxed">
              Ikuti tes bicara interaktif 5 menit kami untuk mengetahui tingkat
              kemampuan bahasa Inggris Anda secara akurat.
            </p>

            {/* Tombol Chamfered (Notched Bottom-Left Corner) */}
            <Link
              href="/register?test=true"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
              className="w-full h-10 bg-white text-[#10b981] hover:text-[#0ea5e9] font-bold text-[12px] flex items-center justify-center transition-all shadow-sm"
            >
              Mulai Tes Gratis
            </Link>
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-4 px-2 pt-2"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold border-2 border-[var(--color-canvas)] flex items-center justify-center">
                  L
                </div>
                <div className="w-7 h-7 rounded-full bg-[var(--color-secondary-purple)] text-white text-[9px] font-bold border-2 border-[var(--color-canvas)] flex items-center justify-center">
                  J
                </div>
                <div className="w-7 h-7 rounded-full bg-[var(--color-success)] text-white text-[9px] font-bold border-2 border-[var(--color-canvas)] flex items-center justify-center">
                  R
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-[#f59e0b]">
                <Star size={11} fill="currentColor" />
                <Star size={11} fill="currentColor" />
                <Star size={11} fill="currentColor" />
                <Star size={11} fill="currentColor" />
                <Star size={11} fill="currentColor" />
              </div>
            </div>

            <p className="text-[11px] text-[var(--color-ink-muted)] leading-relaxed">
              <span className="font-bold text-[var(--color-primary)]">
                98% siswa
              </span>{" "}
              merasakan peningkatan kelancaran berbicara setelah minggu pertama
              berlatih harian.
            </p>
          </motion.div>
        </div>
      </main>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto w-full px-5 py-6 border-t border-[var(--color-hairline-soft)] text-center text-[11px] text-[var(--color-ink-muted)] z-10 relative">
        <p>
          © 2026 Meupakat. Dibuat untuk latihan percakapan bahasa Inggris
          interaktif. Gratis & Terbuka.
        </p>
      </footer>

      {/* Floating Mobile Install PWA Banner */}
      <AnimatePresence>
        {isMobile && isInstallable && !isInstalled && !isBannerDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-[var(--color-surface-modal)] border border-[var(--color-hairline)] rounded-2xl shadow-xl flex items-center justify-between gap-4 max-w-md mx-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                <MeupakatLogoIcon />
              </div>
              <div className="text-left">
                <h4 className="text-[13px] font-bold text-[var(--color-ink)] leading-tight">
                  Instal Meupakat
                </h4>
                <p className="text-[11px] text-[var(--color-ink-muted)] leading-snug mt-0.5">
                  Latih speaking English lebih cepat & mudah dari layar utama!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={triggerInstall}
                className="px-4 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] text-[11px] font-bold rounded-full shadow-sm transition-all cursor-pointer"
              >
                Instal
              </button>
              <button
                onClick={dismissBanner}
                className="p-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors rounded-full hover:bg-[var(--color-surface-soft)] cursor-pointer"
                aria-label="Tutup"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
