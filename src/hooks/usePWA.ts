'use client';

import { useState, useEffect } from 'react';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkStandalone();

    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMob = /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(userAgent);
      setIsMobile(isMob);
    };

    checkDevice();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Support iOS: iOS Safari does not support beforeinstallprompt.
    // If it is iOS and not running standalone, we can consider it "installable"
    // to show instructions or banner.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    if (isIOS && !isStandaloneMode) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (typeof window === 'undefined') return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIOS) {
      alert(
        'Untuk menginstal di iOS/Safari:\n' +
        '1. Ketuk tombol "Share" (Bagikan) di bar bawah browser Safari.\n' +
        '2. Gulir ke bawah lalu pilih "Add to Home Screen" (Tambahkan ke Layar Utama).\n' +
        '3. Ketuk "Add" (Tambah) di pojok kanan atas.'
      );
      return;
    }

    if (!deferredPrompt) {
      console.warn('Install prompt is not available yet.');
      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return {
    isInstallable,
    isInstalled,
    isMobile,
    triggerInstall,
  };
}
