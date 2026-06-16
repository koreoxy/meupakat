'use client';
// src/components/features/PushToTalkButton.tsx
// Push-to-talk recording button with error handling

import { cn } from '@/lib/utils/cn';

interface PushToTalkButtonProps {
  isRecording: boolean;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
  className?: string;
}

/** Large push-to-talk button with pulse animation while recording */
export default function PushToTalkButton({
  isRecording,
  disabled = false,
  onStart,
  onStop,
  className,
}: PushToTalkButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      id="push-to-talk-btn"
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={isRecording ? 'Recording… Click to stop' : 'Click to speak'}
      aria-pressed={isRecording}
      className={cn(
        'relative w-20 h-20 rounded-full',
        'flex items-center justify-center',
        'transition-all duration-200 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#10b981]/50',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        isRecording
          ? 'bg-gradient-to-br from-red-500 to-rose-600 scale-110 animate-pulse-record'
          : 'bg-gradient-to-br from-[#10b981] to-[#059669] hover:scale-105 active:scale-95',
        className
      )}
      style={{
        boxShadow: isRecording
          ? '0 0 0 0 rgba(239,68,68,0.5), 0 0 24px rgba(239,68,68,0.4)'
          : '0 0 24px rgba(16,185,129,0.4)',
      }}
    >
      {/* Mic icon */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn('w-8 h-8 text-white transition-transform duration-200', isRecording && 'scale-90')}
      >
        <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
        <path d="M19 10a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.07A7 7 0 0 0 19 10z" />
      </svg>

      {/* Outer ring pulse when recording */}
      {isRecording && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" />
          <span className="absolute -inset-3 rounded-full border-2 border-red-400/40" />
        </>
      )}
    </button>
  );
}
