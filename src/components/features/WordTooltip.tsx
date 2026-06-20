'use client';
// src/components/features/WordTooltip.tsx
// Kamus interaktif: klik kata di transkrip → popover dengan definisi, IPA, audio, bookmark

import { useState, useEffect, useRef, useCallback } from 'react';
import { saveVocabulary } from '@/app/actions/vocabulary';

interface DictionaryEntry {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
}

interface WordTooltipProps {
  word: string;
  onClose: () => void;
  onBookmarkSuccess?: () => void;
}

export default function WordTooltip({ word, onClose, onBookmarkSuccess }: WordTooltipProps) {
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanWord = word.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
    if (!cleanWord) { onClose(); return; }

    setIsLoading(true);
    fetch(`/api/dictionary?word=${encodeURIComponent(cleanWord)}`)
      .then((r) => r.json())
      .then((data) => {
        setEntry(data);
        setIsLoading(false);
      })
      .catch(() => {
        setEntry({
          word: cleanWord,
          phonetic: '',
          partOfSpeech: 'word',
          definition: 'Definition unavailable. Check your connection.',
          example: '',
        });
        setIsLoading(false);
      });
  }, [word, onClose]);

  const handleSpeak = useCallback(() => {
    if (!entry || isSpeaking) return;
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(entry.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [entry, isSpeaking]);

  const handleBookmark = useCallback(async () => {
    if (!entry || isBookmarking || isBookmarked) return;
    setIsBookmarking(true);
    const result = await saveVocabulary({
      word: entry.word,
      phonetic: entry.phonetic,
      partOfSpeech: entry.partOfSpeech,
      definition: entry.definition,
      example: entry.example,
    });
    if (result.success) {
      setIsBookmarked(true);
      onBookmarkSuccess?.();
      // Notify missions of vocab lookup
      fetch('/api/missions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'vocab_lookup', increment: 1 }) }).catch(() => {});
    }
    setIsBookmarking(false);
  }, [entry, isBookmarking, isBookmarked, onBookmarkSuccess]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full sm:max-w-sm mx-auto animate-fade-in-up"
        style={{
          background: 'var(--color-surface-modal)',
          border: '1px solid var(--color-hairline)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--color-hairline)' }} />

        {isLoading ? (
          <div className="space-y-3 py-4">
            <div className="h-7 w-32 rounded-lg skeleton" />
            <div className="h-4 w-20 rounded skeleton" />
            <div className="h-4 w-full rounded skeleton" />
            <div className="h-4 w-3/4 rounded skeleton" />
          </div>
        ) : entry ? (
          <>
            {/* Word + IPA + Part of Speech */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[24px] font-black text-[var(--color-ink)] leading-none capitalize">
                  {entry.word}
                </h2>
                {entry.phonetic && (
                  <p className="text-[13px] text-[var(--color-ink-muted)] mt-1 font-mono">
                    {entry.phonetic}
                  </p>
                )}
                <span
                  className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1.5"
                  style={{ background: 'rgba(58,134,255,0.15)', color: 'var(--color-primary)' }}
                >
                  {entry.partOfSpeech}
                </span>
              </div>

              {/* Speak button */}
              <button
                onClick={handleSpeak}
                disabled={isSpeaking}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: isSpeaking ? 'rgba(58,134,255,0.2)' : 'var(--color-surface-active)',
                  border: '1px solid var(--color-hairline)',
                  color: isSpeaking ? 'var(--color-primary)' : 'var(--color-ink-secondary)',
                }}
                title="Hear pronunciation"
              >
                {isSpeaking ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M6 4h2v16H6zm10 0h2v16h-2z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.553 3.064A.75.75 0 0 1 12 3.75v16.5a.75.75 0 0 1-1.255.555L5.46 15H2.75A1.75 1.75 0 0 1 1 13.25v-2.5C1 9.784 1.784 9 2.75 9H5.46l5.285-5.805a.75.75 0 0 1 .808-.13zm5.033 3.5a.75.75 0 0 1 1.06 0 7.5 7.5 0 0 1 0 10.606.75.75 0 1 1-1.06-1.06 6 6 0 0 0 0-8.486.75.75 0 0 1 0-1.06zm-2.122 2.121a.75.75 0 0 1 1.061 0 4.5 4.5 0 0 1 0 6.364.75.75 0 1 1-1.06-1.06 3 3 0 0 0 0-4.244.75.75 0 0 1 0-1.06z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Definition */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: 'var(--color-surface-soft)', border: '1px solid var(--color-hairline-soft)' }}
            >
              <p className="text-[13px] font-semibold text-[var(--color-ink-muted)] mb-1.5 uppercase tracking-wide">
                Definition
              </p>
              <p className="text-[14px] text-[var(--color-ink)] leading-relaxed">{entry.definition}</p>
            </div>

            {/* Example */}
            {entry.example && (
              <div className="mb-4">
                <p className="text-[12px] text-[var(--color-ink-muted)] font-semibold mb-1">Example</p>
                <p className="text-[13px] text-[var(--color-ink-secondary)] italic leading-relaxed">
                  &ldquo;{entry.example}&rdquo;
                </p>
              </div>
            )}

            {/* Bookmark button */}
            <button
              onClick={handleBookmark}
              disabled={isBookmarking || isBookmarked}
              className="w-full py-3 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]"
              style={{
                background: isBookmarked
                  ? 'rgba(16,185,129,0.15)'
                  : 'var(--color-primary)',
                color: isBookmarked ? '#10b981' : '#fff',
                border: isBookmarked ? '1px solid rgba(16,185,129,0.3)' : 'none',
              }}
            >
              {isBookmarked ? (
                <>✅ Saved to Vocabulary</>
              ) : isBookmarking ? (
                <>⏳ Saving...</>
              ) : (
                <>⭐ Save to My Vocabulary</>
              )}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
