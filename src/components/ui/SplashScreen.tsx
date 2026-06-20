'use client';

import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Show splash screen for 2.2 seconds (allowing logo animation to complete)
    // then trigger fade out
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      const destroyTimer = setTimeout(() => {
        setIsVisible(false);
      }, 550); // fade out duration
      return () => clearTimeout(destroyTimer);
    }, 2200);

    return () => clearTimeout(fadeTimer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#0c0d0e] flex flex-col items-center justify-center transition-all duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Decorative radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(58,134,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="flex flex-col items-center gap-6 z-10">
        {/* Animated SVG Logo */}
        <div className="relative w-24 h-24 flex items-center justify-center animate-logo-pop">
          {/* Outer glowing halo */}
          <div className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-full blur-2xl animate-pulse" />
          
          <svg
            viewBox="0 0 24 24"
            className="w-20 h-20 text-[var(--color-primary)] drop-shadow-[0_0_15px_rgba(58,134,255,0.5)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Speech bubble path - animated drawing */}
            <path
              className="animate-draw-stroke"
              d="M21 11.5c0 4.5-4.5 8-9 8c-1.8 0-3.5-1-5-2L3 19.5l1.8-4.2C3.8 14 3.2 12.5 3.2 11.5c0-4.5 4.3-8.3 8.8-8.3c4.5 0 9 3.8 9 8.3z"
            />
            {/* The letter 'M' inside - animated drawing with slightly delayed onset or same */}
            <path
              className="animate-draw-stroke"
              style={{ animationDelay: '0.3s' }}
              d="M8.5 14.5V9l3.5 3l3.5-3v5.5"
            />
          </svg>
        </div>

        {/* Brand Name with letter-spacing tracking reveal */}
        <div className="flex flex-col items-center gap-1 text-center mt-2">
          <h1 className="font-display-md text-white text-3xl font-extrabold tracking-widest uppercase animate-text-reveal animate-letter-spacing">
            Meupakat
          </h1>
          <p className="text-[12px] text-slate-400 font-semibold tracking-[0.2em] uppercase opacity-0 animate-text-reveal" style={{ animationDelay: '1.3s' }}>
            SPEAKING ENGLISH APP
          </p>
        </div>
      </div>

      {/* Sleek bottom loader line */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-[var(--color-primary)] rounded-full animate-pulse w-full origin-left" style={{ animation: 'pulse 1.8s ease-in-out infinite' }} />
      </div>
    </div>
  );
}
