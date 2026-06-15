'use client';
// src/hooks/useSmartTimer.ts
// Smart timer that only counts when user is actively speaking or listening

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSmartTimerOptions {
  targetSeconds: number;
  onComplete?: () => void;
}

interface UseSmartTimerReturn {
  elapsedSeconds: number;
  remainingSeconds: number;
  isActive: boolean;
  isCompleted: boolean;
  percentComplete: number;
  startListening: () => void;
  stopListening: () => void;
  startSpeaking: () => void;
  stopSpeaking: () => void;
  reset: () => void;
}

/**
 * Smart Timer hook — only accumulates time when the user is
 * actively listening to AI audio OR actively recording their voice.
 * This prevents idle time from counting toward the daily target.
 */
export function useSmartTimer({
  targetSeconds,
  onComplete,
}: UseSmartTimerOptions): UseSmartTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const completedRef = useRef(false);

  const isActive = isListening || isSpeaking;

  // Tick every second when active
  useEffect(() => {
    if (isActive && !completedRef.current) {
      intervalRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSeconds(elapsedRef.current);

        if (elapsedRef.current >= targetSeconds && !completedRef.current) {
          completedRef.current = true;
          setIsCompleted(true);
          onComplete?.();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, targetSeconds, onComplete]);

  const startListening = useCallback(() => setIsListening(true), []);
  const stopListening = useCallback(() => setIsListening(false), []);
  const startSpeaking = useCallback(() => setIsSpeaking(true), []);
  const stopSpeaking = useCallback(() => setIsSpeaking(false), []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    elapsedRef.current = 0;
    completedRef.current = false;
    setElapsedSeconds(0);
    setIsListening(false);
    setIsSpeaking(false);
    setIsCompleted(false);
  }, []);

  const percentComplete = Math.min(
    100,
    Math.round((elapsedSeconds / targetSeconds) * 100)
  );

  return {
    elapsedSeconds,
    remainingSeconds: Math.max(0, targetSeconds - elapsedSeconds),
    isActive,
    isCompleted,
    percentComplete,
    startListening,
    stopListening,
    startSpeaking,
    stopSpeaking,
    reset,
  };
}
