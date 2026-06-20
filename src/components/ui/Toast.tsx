'use client';
// src/components/ui/Toast.tsx

import { useEffect, useState, useCallback, createContext, useContext, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import type { ToastMessage } from '@/types';

// ─── Toast Context ────────────────────────────────────────────────────────────

interface ToastContextValue {
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Toast Item ───────────────────────────────────────────────────────────────

const iconMap: Record<ToastMessage['type'], string> = {
  success: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
};

const colorMap: Record<ToastMessage['type'], string> = {
  success: 'border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
  warning: 'border-amber-500/30 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300',
  error: 'border-red-500/30 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300',
  info: 'border-sky-500/30 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300',
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration ?? 3500);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm',
        'shadow-[0_4px_24px_rgba(0,0,0,0.4)] w-full',
        'transition-all duration-300 transform',
        colorMap[toast.type],
        visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95'
      )}
    >
      <span className="text-lg shrink-0 mt-0.5">{iconMap[toast.type]}</span>
      <p className="text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="ml-auto shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Toast Provider ───────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const lastToastTimeRef = useRef<number>(0);

  const showToast = useCallback(
    (message: string, type: ToastMessage['type'] = 'info', duration = 3500) => {
      const now = Date.now();
      if (now - lastToastTimeRef.current < 800) {
        return;
      }
      lastToastTimeRef.current = now;

      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Portal-like fixed container */}
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0 z-[9999] flex flex-col gap-2 items-center w-[calc(100vw-32px)] sm:max-w-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
