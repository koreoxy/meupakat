'use client';
// src/hooks/useSpeechServices.ts
// Text-to-Speech (TTS) dan Speech-to-Text (STT)
//
// TTS Strategy (priority order):
//   1. OpenAI TTS via /api/tts — audio natural berkualitas tinggi (jika API key tersedia)
//   2. Web Speech API (SpeechSynthesis) — fallback gratis berbasis browser

import { useState, useRef, useCallback } from 'react';

interface UseTTSReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  /** true jika menggunakan OpenAI TTS, false jika fallback ke Web Speech API */
  isUsingOpenAI: boolean;
}

// Cache sederhana untuk blob URL audio agar tidak double request untuk teks yang sama
const audioCache = new Map<string, string>();

/**
 * TTS hook dengan strategi dual-mode:
 * - Coba OpenAI /api/tts untuk kualitas premium
 * - Fallback otomatis ke Web Speech API jika gagal/tidak tersedia
 */
export function useTTS(
  onStart?: () => void,
  onEnd?: () => void
): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUsingOpenAI, setIsUsingOpenAI] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ─── OpenAI TTS via API Route ───────────────────────────────────────────────

  const speakWithOpenAI = useCallback(
    async (text: string): Promise<boolean> => {
      const cacheKey = text.slice(0, 100);
      let audioUrl = audioCache.get(cacheKey);

      if (!audioUrl) {
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        try {
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice: 'nova' }),
            signal: abortControllerRef.current.signal,
          });

          // 503 = API key belum dikonfigurasi → fallback ke Web Speech
          if (!response.ok) return false;

          const blob = await response.blob();
          audioUrl = URL.createObjectURL(blob);

          // LRU cache sederhana: max 20 entries
          if (audioCache.size >= 20) {
            const firstKey = audioCache.keys().next().value;
            if (firstKey) {
              URL.revokeObjectURL(audioCache.get(firstKey)!);
              audioCache.delete(firstKey);
            }
          }
          audioCache.set(cacheKey, audioUrl);
        } catch (err) {
          if ((err as Error).name === 'AbortError') return false;
          console.warn('[TTS] OpenAI fetch failed, falling back to Web Speech:', err);
          return false;
        }
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsUsingOpenAI(true);

      return new Promise((resolve) => {
        audio.onplay = () => {
          setIsSpeaking(true);
          onStart?.();
        };
        audio.onended = () => {
          setIsSpeaking(false);
          setIsUsingOpenAI(false);
          onEnd?.();
          resolve(true);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setIsUsingOpenAI(false);
          onEnd?.();
          resolve(false);
        };
        audio.play().catch(() => resolve(false));
      });
    },
    [onStart, onEnd]
  );

  // ─── Web Speech API Fallback ────────────────────────────────────────────────

  const speakWithWebSpeech = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setIsSpeaking(false);
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(
          (v) =>
            v.lang === 'en-US' &&
            (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex'))
        ) ?? voices.find((v) => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;

      // Safety timeout: Chrome sometimes hangs and never fires onend
      // Estimasi: 1 karakter = ~80ms + 2000ms buffer
      const timeoutMs = Math.max(3000, text.length * 80 + 2000);
      let durationTimer: ReturnType<typeof setTimeout>;
      let startTimer: ReturnType<typeof setTimeout>;

      const finishUtterance = () => {
        clearTimeout(durationTimer);
        clearTimeout(startTimer);
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onstart = () => {
        clearTimeout(startTimer); // Prevent the 3s kill switch from firing!
        setIsSpeaking(true);
        setIsUsingOpenAI(false);
        onStart?.();
        
        // Start safety timer when speech actually starts
        durationTimer = setTimeout(() => {
          console.warn('[TTS] Web Speech API timeout. Forcing onEnd.');
          window.speechSynthesis?.cancel();
          finishUtterance();
        }, timeoutMs);
      };
      
      utterance.onend = finishUtterance;
      
      utterance.onerror = (e) => {
        console.warn('[TTS] Web Speech API error:', e);
        finishUtterance();
      };

      utteranceRef.current = utterance;
      
      // Safety timer in case onstart never fires
      startTimer = setTimeout(() => {
        console.warn('[TTS] Web Speech API never started. Forcing onEnd.');
        window.speechSynthesis?.cancel();
        finishUtterance();
      }, 3000);
      
      window.speechSynthesis.speak(utterance);
    },
    [onStart, onEnd]
  );

  // ─── Main speak function ────────────────────────────────────────────────────

  const speak = useCallback(
    async (text: string) => {
      // Stop apapun yang sedang berjalan
      audioRef.current?.pause();
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();

      // Coba OpenAI dulu, fallback ke Web Speech jika gagal
      const openAISuccess = await speakWithOpenAI(text);
      if (!openAISuccess) {
        speakWithWebSpeech(text);
      }
    },
    [speakWithOpenAI, speakWithWebSpeech]
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsUsingOpenAI(false);
  }, []);

  return { speak, stop, isSpeaking, isUsingOpenAI };
}

// ─── STT (unchanged) ─────────────────────────────────────────────────────────

interface UseSTTReturn {
  startRecording: () => void;
  stopRecording: () => void;
  isRecording: boolean;
  transcript: string;
  error: string | null;
}

/**
 * STT menggunakan browser's Web Speech API (SpeechRecognition).
 * Berjalan di Chrome/Edge. Gracefully degrades di browser lain.
 */
export function useSTT(onResult?: (transcript: string) => void): UseSTTReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const accumulatedTextRef = useRef('');

  const startRecording = useCallback(() => {
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError('Speech recognition tidak didukung di browser ini. Gunakan Chrome atau Edge.');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SpeechRecognitionAPI() as any;
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    accumulatedTextRef.current = '';
    setTranscript('');

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + ' ';
        } else {
          interimTranscript += transcriptSegment;
        }
      }

      if (finalTranscript) {
        accumulatedTextRef.current += finalTranscript;
      }
      
      const currentFullText = (accumulatedTextRef.current + interimTranscript).trim();
      setTranscript(currentFullText);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setIsRecording(false);
      // PRD Acceptance Criteria: jika network putus, jangan crash — tampilkan toast
      if (event.error === 'network') {
        setError('Network error. Cek koneksimu dan coba lagi. Progress waktu kamu aman! ✅');
      } else if (event.error === 'not-allowed') {
        setError('Akses mikrofon ditolak. Aktifkan izin mikrofon di browser.');
      } else {
        setError(`Error rekaman: ${event.error}. Silakan coba lagi.`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      const finalText = accumulatedTextRef.current.trim();
      onResult?.(finalText);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  return { startRecording, stopRecording, isRecording, transcript, error };
}
