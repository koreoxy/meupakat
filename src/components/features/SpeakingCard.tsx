'use client';
// src/components/features/SpeakingCard.tsx

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { useTTS, useSTT } from '@/hooks/useSpeechServices';
import VoiceWaveform from './VoiceWaveform';
import { useAppStore } from '@/hooks/useAppStore';
import confetti from 'canvas-confetti';
import { useTranslation } from '@/hooks/useTranslation';

interface SpeakingMaterial {
  id: string;
  type: 'quote' | 'movie_script' | 'song_lyrics';
  content: string;
  translation: string | null;
  source: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
}

interface SpeakingCardProps {
  material: SpeakingMaterial;
  onSuccessSubmit: (xpGained: number, materialId: string) => void;
  index: number;
  viewMode: 'desktop' | 'mobile';
  isPracticed?: boolean;
}

const DIFFICULTY_COLORS = {
  beginner:     'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  intermediate: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  advanced:     'bg-purple-500/10 text-purple-500 border border-purple-500/20',
};

const CATEGORY_NAMES = {
  quote:        { en: 'Quote',       id: 'Kutipan',    emoji: '💬' },
  movie_script: { en: 'Movie Script', id: 'Script Film', emoji: '🎬' },
  song_lyrics:  { en: 'Song Lyric',  id: 'Lirik Lagu', emoji: '🎵' },
};

export default function SpeakingCard({ material, onSuccessSubmit, index, viewMode, isPracticed = false }: SpeakingCardProps) {
  const { completeSession } = useAppStore();
  const { language } = useTranslation();

  const [showTranslation, setShowTranslation] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [secondsSpoken, setSecondsSpoken] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultPane, setShowResultPane] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tts = useTTS(() => {}, () => {});

  const handleSTTResult = (finalTranscript: string) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const score = calculateSimilarity(material.content, finalTranscript || '');
    setAccuracyScore(score);
    setShowResultPane(true);
    if (score >= 80) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const stt = useSTT(handleSTTResult);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const toggleRecording = () => {
    if (isPracticed) return;
    if (tts.isSpeaking) tts.stop();
    if (stt.isRecording) {
      stt.stopRecording();
    } else {
      setSecondsSpoken(0);
      setAccuracyScore(null);
      setShowResultPane(false);
      stt.startRecording();
      timerRef.current = setInterval(() => setSecondsSpoken(p => p + 1), 1000);
    }
  };

  const calculateSimilarity = (original: string, spoken: string): number => {
    const clean = (s: string) => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').trim();
    const origWords = clean(original).split(/\s+/).filter(Boolean);
    const spokenWords = clean(spoken).split(/\s+/).filter(Boolean);
    if (!origWords.length || !spokenWords.length) return 0;
    const matches = origWords.filter(w => spokenWords.includes(w)).length;
    let score = Math.round((matches / origWords.length) * 100);
    if (spokenWords.length / Math.max(1, secondsSpoken) > 6) score = Math.max(10, score - 15);
    return Math.min(100, Math.max(0, score));
  };

  const handleSubmit = async () => {
    if (isSubmitting || accuracyScore === null) return;
    setIsSubmitting(true);
    try {
      const aiScore = Math.min(30, Math.round((accuracyScore / 100) * 30));
      const res = await completeSession(Math.max(5, secondsSpoken), aiScore);
      onSuccessSubmit(res.xpGained, material.id);
      setShowResultPane(false);
      setAccuracyScore(null);
    } catch (err) {
      console.error('Error submitting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const category = CATEGORY_NAMES[material.type];
  const categoryLabel = language === 'id' ? category.id : category.en;
  const scoreColor = accuracyScore !== null
    ? accuracyScore >= 80 ? 'text-emerald-500' : accuracyScore >= 50 ? 'text-yellow-500' : 'text-red-500'
    : '';
  const scoreFeedback = accuracyScore !== null
    ? accuracyScore >= 80
      ? (language === 'id' ? 'Luar biasa! Pelafalan Anda sangat mirip.' : 'Excellent! Pronunciation matches well.')
      : accuracyScore >= 50
      ? (language === 'id' ? 'Bagus! Coba perjelas artikulasi Anda.' : 'Good! Try to articulate cleaner.')
      : (language === 'id' ? 'Coba lagi! Tirukan audio referensi.' : 'Try again! Replicate the audio.')
    : '';

  // ─── DESKTOP LAYOUT ────────────────────────────────────────────────
  if (viewMode === 'desktop') {
    return (
      <div
        className={cn(
          'flex flex-col bg-[var(--color-surface-card)] border border-[var(--color-hairline)] rounded-[var(--radius-xl)] p-5 transition-all duration-200 relative animate-fade-in-up overflow-hidden',
          isPracticed
            ? 'opacity-60'
            : 'hover:border-[var(--color-primary)] hover:ring-1 hover:ring-[var(--color-primary)]/20'
        )}
        style={{ animationDelay: `${index * 0.07}s` }}
      >
        {/* Practiced overlay */}
        {isPracticed && (
          <div className="absolute inset-0 bg-[var(--color-surface-card)]/80 backdrop-blur-[2px] rounded-[var(--radius-xl)] z-20 flex flex-col items-center justify-center gap-3">
            <span className="text-4xl">✅</span>
            <p className="text-[13px] font-bold text-[var(--color-ink)]">
              {language === 'id' ? 'Sudah Selesai Hari Ini!' : 'Completed Today!'}
            </p>
            <p className="text-[11px] text-[var(--color-ink-muted)] text-center px-4">
              {language === 'id' ? 'Kartu baru tersedia besok 🌅' : 'New card available tomorrow 🌅'}
            </p>
          </div>
        )}

        {/* Top badges */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-[var(--color-ink-secondary)] bg-[var(--color-surface-active)] px-2 py-0.5 rounded-[var(--radius-xs)] flex items-center gap-1 uppercase tracking-wider">
            {category.emoji} {categoryLabel}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide', DIFFICULTY_COLORS[material.difficulty])}>
              {material.difficulty}
            </span>
            <span className="text-[11px] font-bold text-[var(--color-primary)]">+{material.xpReward} XP</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center py-3 text-center">
          <p className="text-[15px] font-semibold text-[var(--color-ink)] leading-relaxed italic select-all">
            &ldquo;{material.content}&rdquo;
          </p>
          <p className="text-[11px] text-[var(--color-ink-muted)] mt-1.5 font-medium">— {material.source}</p>
          <div className="mt-3">
            {showTranslation && (
              <p className="text-[12px] text-[var(--color-ink-secondary)] bg-[var(--color-surface-active)] p-2 rounded-[var(--radius-sm)] border border-[var(--color-hairline)] animate-fade-in mb-1.5">
                {material.translation || (language === 'id' ? 'Tidak ada terjemahan.' : 'No translation.')}
              </p>
            )}
            <button
              onClick={() => setShowTranslation(p => !p)}
              className="text-[10px] font-semibold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
            >
              {showTranslation ? (language === 'id' ? '🙈 Sembunyikan' : '🙈 Hide') : (language === 'id' ? '👁️ Terjemahan' : '👁️ Translate')}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-3 pt-3 border-t border-[var(--color-hairline)] flex flex-col gap-2">
          {(tts.isSpeaking || stt.isRecording) && (
            <div className="flex items-center justify-center gap-2 h-5">
              {tts.isSpeaking && <><span className="text-[9px] text-[var(--color-ink-muted)]">Playing...</span><VoiceWaveform isActive type="ai" barCount={5} /></>}
              {stt.isRecording && <><span className="text-[9px] text-red-500 animate-pulse font-bold">{secondsSpoken}s...</span><VoiceWaveform isActive type="user" barCount={5} /></>}
            </div>
          )}
          {stt.isRecording && (
            <p className="text-[10px] italic text-emerald-500 text-center truncate">{stt.transcript || (language === 'id' ? 'Mulai berbicara...' : 'Speak now...')}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={tts.isSpeaking ? () => tts.stop() : () => tts.speak(material.content)}
              disabled={isPracticed}
              className={cn(
                'flex-1 h-9 rounded-[var(--radius-sm)] text-[12px] font-semibold flex items-center justify-center gap-1.5 border transition-all',
                tts.isSpeaking
                  ? 'bg-[var(--color-primary)] text-white border-transparent'
                  : 'bg-[var(--color-surface-active)] text-[var(--color-ink-secondary)] border-[var(--color-hairline)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed'
              )}
            >
              {tts.isSpeaking ? '⏹️ Stop' : <><svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M8 5v14l11-7z"/></svg>{language === 'id' ? 'Dengarkan' : 'Listen'}</>}
            </button>
            <button
              onClick={toggleRecording}
              disabled={isPracticed}
              className={cn(
                'flex-1 h-9 rounded-[var(--radius-sm)] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all',
                stt.isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:cursor-not-allowed disabled:bg-[var(--color-surface-active)] disabled:text-[var(--color-ink-muted)]'
              )}
            >
              {stt.isRecording ? '⏹️ Stop' : <><svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17.3 11c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>{language === 'id' ? 'Rekam' : 'Record'}</>}
            </button>
          </div>
        </div>

        {/* Inline result overlay */}
        {showResultPane && accuracyScore !== null && (
          <div className="absolute inset-0 bg-[var(--color-surface-modal)]/95 rounded-[var(--radius-xl)] p-5 flex flex-col justify-between z-10 border border-[var(--color-hairline)] animate-scale-in backdrop-blur-sm">
            <div className="text-center flex-1 flex flex-col justify-center">
              <span className="text-3xl mb-2">📊</span>
              <h4 className="text-[14px] font-bold text-[var(--color-ink)] mb-3">{language === 'id' ? 'Hasil Pengucapan' : 'Pronunciation Score'}</h4>
              <span className={cn('text-4xl font-black', scoreColor)}>{accuracyScore}%</span>
              <p className="text-[10px] text-[var(--color-ink-muted)] mt-1 mb-3 font-medium">{language === 'id' ? 'Kemiripan Kata' : 'Word Similarity'}</p>
              <p className="text-[11px] text-[var(--color-ink-secondary)] italic px-2">{scoreFeedback}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setShowResultPane(false); setAccuracyScore(null); }} className="flex-1 h-8 rounded-[var(--radius-sm)] text-[11px] font-semibold text-[var(--color-ink-secondary)] bg-[var(--color-surface-active)] hover:text-[var(--color-ink)] border border-[var(--color-hairline)] transition-colors">
                {language === 'id' ? '🔄 Ulangi' : '🔄 Try Again'}
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-8 rounded-[var(--radius-sm)] text-[11px] font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-40 transition-colors flex items-center justify-center">
                {isSubmitting ? <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" /> : (language === 'id' ? 'Kirim ✓' : 'Submit ✓')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── MOBILE TIKTOK REELS LAYOUT ────────────────────────────────────
  return (
    <div
      className="relative w-screen flex-shrink-0 bg-[#090b0c] overflow-hidden"
      style={{ height: '100dvh', scrollSnapAlign: 'start' }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none z-0" />

      {/* Practiced overlay for mobile */}
      {isPracticed && (
        <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <span className="text-6xl">✅</span>
          <p className="text-white text-[18px] font-bold">{language === 'id' ? 'Sudah Selesai Hari Ini!' : 'Completed Today!'}</p>
          <p className="text-white/60 text-[13px] text-center px-8">{language === 'id' ? 'Kartu speaking baru tersedia besok 🌅' : 'New speaking card available tomorrow 🌅'}</p>
        </div>
      )}

      {/* Category badge */}
      <div className="absolute top-28 left-4 z-20">
        <span className="text-[10px] font-bold text-white/80 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1 uppercase tracking-wider">
          {category.emoji} {categoryLabel}
        </span>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-10 z-10 -translate-y-8">
        <p className="text-white text-[22px] font-semibold leading-snug text-center italic" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>
          &ldquo;{material.content}&rdquo;
        </p>
        <p className="mt-3 text-indigo-300 text-[12px] font-medium text-center">— {material.source}</p>
        {showTranslation && (
          <div className="mt-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 max-w-xs animate-fade-in">
            <p className="text-slate-200 text-[12px] leading-relaxed text-center">{material.translation || (language === 'id' ? 'Tidak ada terjemahan.' : 'No translation.')}</p>
          </div>
        )}
        {stt.isRecording && (
          <p className="mt-3 text-emerald-400 text-[12px] italic text-center animate-pulse max-w-xs truncate">
            {stt.transcript || (language === 'id' ? 'Mulai berbicara...' : 'Speak now...')}
          </p>
        )}
      </div>

      {/* Floating right action bar */}
      {!isPracticed && (
        <div className="absolute right-4 bottom-44 z-20 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-black text-yellow-400">+{material.xpReward} XP</span>
            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide', DIFFICULTY_COLORS[material.difficulty])}>
              {material.difficulty}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={tts.isSpeaking ? () => tts.stop() : () => tts.speak(material.content)}
              className={cn('w-12 h-12 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md transition-all', tts.isSpeaking ? 'bg-[var(--color-primary)] shadow-[0_0_20px_rgba(58,134,255,0.5)]' : 'bg-white/10')}
            >
              {tts.isSpeaking ? <span className="text-white text-sm">⏹️</span> : <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>}
            </button>
            <span className="text-white/50 text-[9px] font-medium">{language === 'id' ? 'Putar' : 'Play'}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setShowTranslation(p => !p)}
              className={cn('w-12 h-12 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md transition-all text-xl', showTranslation ? 'bg-indigo-500/40 border-indigo-400/40' : 'bg-white/10')}
            >
              {showTranslation ? '🙈' : '👁️'}
            </button>
            <span className="text-white/50 text-[9px] font-medium">{language === 'id' ? 'Arti' : 'Translate'}</span>
          </div>
          {(tts.isSpeaking || stt.isRecording) && <VoiceWaveform isActive type={tts.isSpeaking ? 'ai' : 'user'} barCount={4} />}
        </div>
      )}

      {/* Big record button — center bottom */}
      {!isPracticed && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          <button
            onClick={toggleRecording}
            className={cn('w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl', stt.isRecording ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-emerald-500 hover:bg-emerald-400 active:scale-95')}
          >
            {stt.isRecording ? <span className="text-2xl">⏹️</span> : <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17.3 11c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>}
          </button>
          <span className="text-white/50 text-[10px] font-medium">
            {stt.isRecording ? `${secondsSpoken}s — ${language === 'id' ? 'Ketuk stop' : 'Tap to stop'}` : (language === 'id' ? 'Ketuk untuk rekam' : 'Tap to record')}
          </span>
        </div>
      )}

      {/* Score result — bottom drawer */}
      {showResultPane && accuracyScore !== null && (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-[var(--color-surface-modal)]/95 backdrop-blur-xl border-t border-[var(--color-hairline)] rounded-t-3xl p-6 animate-slide-up">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-1 bg-[var(--color-hairline)] rounded-full mb-5" />
            <span className="text-3xl mb-2">📊</span>
            <h4 className="text-[15px] font-bold text-[var(--color-ink)] mb-4">{language === 'id' ? 'Hasil Pengucapan' : 'Pronunciation Score'}</h4>
            <span className={cn('text-5xl font-black mb-1', scoreColor)}>{accuracyScore}%</span>
            <p className="text-[11px] text-[var(--color-ink-muted)] mb-3 font-medium">{language === 'id' ? 'Kemiripan Kata' : 'Word Similarity'}</p>
            <p className="text-[12px] text-[var(--color-ink-secondary)] italic mb-6 max-w-xs">{scoreFeedback}</p>
            <div className="flex gap-3 w-full max-w-xs">
              <button onClick={() => { setShowResultPane(false); setAccuracyScore(null); }} className="flex-1 h-11 rounded-2xl text-[13px] font-semibold text-[var(--color-ink-secondary)] bg-[var(--color-surface-active)] border border-[var(--color-hairline)] hover:text-[var(--color-ink)] transition-colors">
                {language === 'id' ? '🔄 Ulangi' : '🔄 Try Again'}
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-11 rounded-2xl text-[13px] font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-40 flex items-center justify-center transition-colors">
                {isSubmitting ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : (language === 'id' ? 'Kirim ✓' : 'Submit ✓')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
