'use client';
// src/components/features/ConversationPlayer.tsx
// Responsive AI conversation player — dark/light mode aware

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import type { Scenario, DynamicChatMessage, ChatAIResponse } from '@/types';
import { useTTS, useSTT } from '@/hooks/useSpeechServices';
import { useSmartTimer } from '@/hooks/useSmartTimer';
import { useSilenceDetector } from '@/hooks/useSilenceDetector';
import { useToast } from '@/components/ui/Toast';
import PushToTalkButton from './PushToTalkButton';
import VoiceWaveform from './VoiceWaveform';
import Button from '@/components/ui/Button';
import WordTooltip from './WordTooltip';
import { useTranslation } from '@/hooks/useTranslation';

interface ConversationPlayerProps {
  scenario: Scenario;
  onComplete: (secondsSpoken: number, aiPerformanceScore: number) => void;
  onCancel?: () => void;
}

interface ChatMessage {
  id: string;
  speaker: 'ai' | 'user';
  text: string;
  isTyping?: boolean;
}

const MAX_USER_TURNS = 5;

export default function ConversationPlayer({ scenario, onComplete, onCancel }: ConversationPlayerProps) {
  const { showToast } = useToast();
  const { t, language } = useTranslation();

  const [messages,       setMessages]       = useState<ChatMessage[]>([]);
  const [dynamicHistory, setDynamicHistory] = useState<DynamicChatMessage[]>([]);
  const [currentHint,    setCurrentHint]    = useState<string | undefined>('');
  const [userTurnCount,  setUserTurnCount]  = useState(0);
  const [isSessionDone,  setIsSessionDone]  = useState(false);
  const [hasStarted,     setHasStarted]     = useState(false);
  const [isUserTurn,     setIsUserTurn]     = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [isRateLimited,  setIsRateLimited]  = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{ grammarScore: number; vocabularyScore: number; feedback: string } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── STT & Silence & Timer ───────────────────────────────────────────────────
  const handleSTTResult = useCallback(
    async (transcript: string) => {
      const speechText = transcript || '(no speech detected)';
      timer.stopSpeaking();
      setIsUserTurn(false);
      setIsWaitingForAI(true);

      setMessages((prev) => [...prev, { id: crypto.randomUUID(), speaker: 'user', text: speechText }]);

      const newHistory: DynamicChatMessage[] = [
        ...dynamicHistory,
        { role: 'user', content: speechText },
      ];
      setDynamicHistory(newHistory);
      setUserTurnCount((prev) => prev + 1);

      const msgId = crypto.randomUUID();
      try {
        setMessages((prev) => [...prev, { id: msgId, speaker: 'ai', text: '', isTyping: true }]);

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newHistory,
            context: scenario.context,
            level: scenario.level,
          }),
        });

        if (res.status === 429) {
          const errorData = await res.json().catch(() => ({}));
          const delaySeconds = errorData.retryAfterSeconds || 15;
          
          setIsWaitingForAI(false);
          setIsRateLimited(true);
          setRateLimitCountdown(delaySeconds);
          setMessages((prev) => prev.filter((m) => m.id !== msgId));

          // Play audio notification (TTS)
          tts.speak(language === 'id' ? "Batas limit sistem tercapai. Harap tunggu sebentar." : "System rate limit reached. Please wait a moment.");

          showToast(language === 'id' ? "Model sedang dalam batasan limit. Harap tunggu sebentar." : "Model rate limit reached. Please wait a moment.", "warning", 5000);
          return;
        }

        if (!res.ok) throw new Error('API Error');

        const data: ChatAIResponse = await res.json();
        setIsWaitingForAI(false);
        setDynamicHistory((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        setCurrentHint(data.hintForUser);
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: data.reply, isTyping: false } : m))
        );
        tts.speak(data.reply);
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        showToast(language === 'id' ? 'Gagal terhubung ke AI. Silakan coba bicara lagi.' : 'Failed to connect to AI. Please try speaking again.', 'error');
        setIsWaitingForAI(false);
        setIsUserTurn(true);
      }
    },
    [dynamicHistory, scenario, showToast, language] // Removed timer/tts to resolve circular dependencies (will be referenced inside callback body at runtime)
  );

  const stt = useSTT(handleSTTResult);

  const isSilent = useSilenceDetector({
    isRecording: stt.isRecording,
    silenceDurationMs: 2500,
  });

  // Auto-stop recording when silence is detected for more than silenceDurationMs
  useEffect(() => {
    if (isSilent && stt.isRecording) {
      stt.stopRecording();
    }
  }, [isSilent, stt]);

  const targetSeconds = scenario.durationMinutes * 60;
  const timer = useSmartTimer({
    targetSeconds,
    onComplete: () => showToast(language === 'id' ? '🎉 Target harian tercapai! Kerja bagus!' : '🎉 Daily target reached! Great job!', 'success', 5000),
    isSilent,
  });

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWaitingForAI]);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (!isRateLimited || rateLimitCountdown <= 0) return;

    const interval = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRateLimited(false);
          setIsUserTurn(true); // Allow user to talk again
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, rateLimitCountdown]);

  // ── TTS ─────────────────────────────────────────────────────────────────────
  const handleTTSStart = useCallback(() => { timer.startListening(); }, [timer]);
  const handleTTSEnd   = useCallback(() => {
    timer.stopListening();
    if (userTurnCount >= MAX_USER_TURNS) {
      finishSessionRef.current?.();
    } else {
      setIsUserTurn(true);
    }
  }, [timer, userTurnCount]);

  const tts = useTTS(handleTTSStart, handleTTSEnd);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    setHasStarted(true);
    const firstTurn = scenario.turns[0];
    if (firstTurn?.speaker === 'ai') {
      const msgId = crypto.randomUUID();
      setMessages([{ id: msgId, speaker: 'ai', text: '', isTyping: true }]);
      setDynamicHistory([{ role: 'assistant', content: firstTurn.text }]);
      setCurrentHint(scenario.turns[1]?.hint);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: firstTurn.text, isTyping: false } : m))
        );
        tts.speak(firstTurn.text);
      }, 800);
    }
  }, [scenario, tts]);

  const finishSession = useCallback(async () => {
    tts.stop();
    timer.stopListening();
    timer.stopSpeaking();
    stt.stopRecording();
    setIsEvaluating(true);

    try {
      const formattedHistory = dynamicHistory.map(h => ({
        role: h.role,
        content: h.content
      }));

      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: formattedHistory }),
      });

      if (!res.ok) throw new Error('Evaluation request failed');

      const data = await res.json();
      setEvaluationResult({
        grammarScore: data.grammarScore ?? 10,
        vocabularyScore: data.vocabularyScore ?? 10,
        feedback: data.feedback || (language === 'id' ? 'Sesi selesai dengan baik! Teruskan latihanmu.' : 'Session completed successfully! Keep practicing.'),
      });
    } catch (err) {
      console.error('Error evaluating session:', err);
      setEvaluationResult({
        grammarScore: 10,
        vocabularyScore: 10,
        feedback: language === 'id' ? 'Sesi latihan selesai dengan baik! Teruskan latihan untuk hasil maksimal.' : 'Session practice completed successfully! Keep practicing for maximum results.',
      });
    } finally {
      setIsEvaluating(false);
    }
  }, [tts, timer, stt, dynamicHistory, language]);

  const handleSubmitResults = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsSessionDone(true);
    const totalScore = (evaluationResult?.grammarScore ?? 10) + (evaluationResult?.vocabularyScore ?? 10);
    setTimeout(() => onComplete(timer.elapsedSeconds, totalScore), 600);
  }, [onComplete, timer.elapsedSeconds, evaluationResult, isSubmitting]);

  const finishSessionRef = useRef<(() => void) | null>(null);
  useEffect(() => { finishSessionRef.current = finishSession; }, [finishSession]);
  useEffect(() => { if (stt.error) showToast(stt.error, 'warning', 5000); }, [stt.error, showToast]);

  const handleSkipVoice = () => {
    tts.stop();
    timer.stopListening();
    if (userTurnCount >= MAX_USER_TURNS) {
      finishSessionRef.current?.();
    } else {
      setIsUserTurn(true);
    }
  };

  const handleEndSessionClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    tts.stop();
    timer.stopListening();
    timer.stopSpeaking();
    stt.stopRecording();
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = '/dashboard';
    }
  };

  // Timer display
  const elapsed = `${Math.floor(timer.elapsedSeconds / 60)}:${(timer.elapsedSeconds % 60).toString().padStart(2, '0')}`;
  const turnProgress = Math.min(100, (userTurnCount / MAX_USER_TURNS) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-canvas)] relative">
      {/* Word Tooltip / Dictionary Modal */}
      {selectedWord && (
        <WordTooltip
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
      {/* Evaluating Overlay */}
      {isEvaluating && (
        <div className="absolute inset-0 z-50 bg-[var(--color-scrim)] backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
            {language === 'id' ? 'AI Evaluator sedang menilai...' : 'AI Evaluator is evaluating...'}
          </h3>
          <p className="text-[13px] text-[var(--color-ink-muted)] mt-1">
            {language === 'id' ? 'Menganalisis tata bahasa dan pilihan kata Anda.' : 'Analyzing your grammar and word choices.'}
          </p>
        </div>
      )}

      {/* Evaluation Results Overlay */}
      {evaluationResult && (
        <div className="absolute inset-0 z-50 bg-[var(--color-canvas)] flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--color-surface-card)] border border-[var(--color-hairline)] rounded-[var(--radius-xl)] p-6 shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <span className="text-4xl">📊</span>
              <h3 className="text-xl font-bold text-[var(--color-ink)] mt-2">
                {language === 'id' ? 'Hasil Evaluasi AI' : 'AI Evaluation Results'}
              </h3>
              <p className="text-[12px] text-[var(--color-ink-muted)] mt-0.5">
                {language === 'id' ? 'Sesi latihan berbicara Anda' : 'Your speaking practice session'}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Grammar Score */}
              <div>
                <div className="flex justify-between text-[13px] font-semibold mb-1">
                  <span className="text-[var(--color-ink-secondary)]">
                    {language === 'id' ? 'Tata Bahasa (Grammar)' : 'Grammar'}
                  </span>
                  <span className="text-[var(--color-ink)]">{evaluationResult.grammarScore} / 15</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-surface-active)] overflow-hidden">
                  <div 
                    className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-1000"
                    style={{ width: `${(evaluationResult.grammarScore / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* Vocabulary Score */}
              <div>
                <div className="flex justify-between text-[13px] font-semibold mb-1">
                  <span className="text-[var(--color-ink-secondary)]">
                    {language === 'id' ? 'Kosakata (Vocabulary)' : 'Vocabulary'}
                  </span>
                  <span className="text-[var(--color-ink)]">{evaluationResult.vocabularyScore} / 15</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-surface-active)] overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(evaluationResult.vocabularyScore / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* Total Bonus */}
              <div className="p-3 bg-[var(--color-surface-active)] rounded-[var(--radius-md)] flex items-center justify-between">
                <span className="text-[12px] font-medium text-[var(--color-ink-secondary)]">
                  {language === 'id' ? 'Skor Bonus XP AI:' : 'AI XP Bonus Score:'}
                </span>
                <span className="text-sm font-bold text-[var(--color-primary)]">+{evaluationResult.grammarScore + evaluationResult.vocabularyScore} XP</span>
              </div>

              {/* Feedback */}
              <div className="p-4 bg-[var(--color-chat-hint-bg)] border border-[var(--color-chat-hint-border)] rounded-[var(--radius-md)]">
                <p className="text-[12px] font-semibold text-[var(--color-warning)] mb-1">
                  {language === 'id' ? '💡 Umpan Balik AI:' : '💡 AI Feedback:'}
                </p>
                <p className="text-[12px] leading-relaxed text-[var(--color-ink-secondary)] italic font-medium">"{evaluationResult.feedback}"</p>
              </div>
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={handleSubmitResults} isLoading={isSubmitting}>
              {language === 'id' ? 'Kirim & Selesaikan Sesi' : 'Submit & Complete Session'}
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Overlay */}
      {showCancelConfirm && (
        <div className="absolute inset-0 z-50 bg-[var(--color-scrim)] backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="w-full max-w-sm bg-[var(--color-surface-modal)] border border-[var(--color-hairline)] rounded-[var(--radius-xl)] p-6 shadow-2xl animate-scale-in">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-lg font-bold text-[var(--color-ink)] mt-3">
              {language === 'id' ? 'Akhiri Sesi?' : 'End Session?'}
            </h3>
            <p className="text-[13px] text-[var(--color-ink-muted)] mt-2">
              {language === 'id'
                ? 'Apakah Anda yakin ingin mengakhiri sesi lebih awal? Anda tidak akan mendapatkan XP reward jika keluar sekarang.'
                : 'Are you sure you want to end the session early? You won\'t earn any XP reward if you exit now.'}
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" size="md" fullWidth onClick={() => setShowCancelConfirm(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button variant="danger" size="md" fullWidth onClick={handleConfirmCancel}>
                {language === 'id' ? 'Akhiri' : 'End'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE VIEW (lg:hidden) ── */}
      <div className="lg:hidden flex flex-col h-full overflow-hidden bg-[#0b141a] dark:bg-[#0b141a] bg-opacity-[0.98] relative">
        {/* WhatsApp Header */}
        <div className="shrink-0 px-3 py-2 bg-[#1f2c34] text-white flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2a3942] flex items-center justify-center text-xl">
              👩‍🏫
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-white leading-tight">AI Tutor ACE</h3>
              {isRateLimited ? (
                <p className="text-[11px] text-red-400 flex items-center gap-1 font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  {language === 'id' ? `Sistem Sibuk (${rateLimitCountdown}s)` : `System Busy (${rateLimitCountdown}s)`}
                </p>
              ) : stt.isRecording ? (
                <p className="text-[11px] text-red-400 flex items-center gap-1 font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  {language === 'id' ? 'Anda Berbicara...' : 'You are Speaking...'}
                </p>
              ) : tts.isSpeaking ? (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {language === 'id' ? 'AI Berbicara...' : 'AI is Speaking...'}
                </p>
              ) : isWaitingForAI ? (
                <p className="text-[11px] text-amber-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {language === 'id' ? 'AI Berpikir...' : 'AI is Thinking...'}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  {language === 'id' ? 'Menunggu' : 'Waiting'}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-[#2a3942] px-2 py-1 rounded text-[12px] font-mono font-bold text-slate-300">
              {elapsed}
            </div>
            <button
              onClick={handleEndSessionClick}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-colors"
              title="End session"
            >
              <EndCallIcon className="w-5 h-5 rotate-[135deg]" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] relative">
          {!hasStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
              <div className="text-4xl animate-float">🎙️</div>
              <div className="bg-[#1f2c34] p-5 rounded-xl border border-slate-700 max-w-xs mx-auto">
                <p className="text-[15px] font-bold text-white mb-2">{scenario.title}</p>
                <p className="text-[12px] text-slate-300 mb-4">
                  {language === 'id' ? 'Tekan mulai untuk memulai latihan percakapan bahasa Inggris Anda.' : 'Press start to begin your English conversation practice.'}
                </p>
                <Button variant="primary" size="md" fullWidth onClick={handleStart} id="start-session-btn-mobile">
                  {language === 'id' ? '🚀 Mulai Sesi' : '🚀 Start Session'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex animate-fade-in-up',
                    msg.speaker === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'px-3 py-2 rounded-lg text-[13.5px] leading-relaxed max-w-[85%] relative shadow-sm',
                      msg.speaker === 'user'
                        ? 'bg-[#005c4b] text-white rounded-tr-none'
                        : 'bg-[#202c33] text-slate-100 rounded-tl-none'
                    )}
                  >
                    {msg.isTyping ? (
                       <div className="flex items-center gap-1 py-1 px-2">
                         {[0, 1, 2].map((i) => (
                           <div
                             key={i}
                             className="w-1.5 h-1.5 rounded-full bg-slate-400"
                             style={{
                               animation: `waveBar 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
                             }}
                           />
                         ))}
                       </div>
                    ) : (
                      <span>{msg.text}</span>
                    )}
                    
                    {msg.speaker === 'ai' && !msg.isTyping && tts.isSpeaking &&
                      msg.id === messages.filter((m) => m.speaker === 'ai').at(-1)?.id && (
                      <div className="mt-2 flex items-center justify-between border-t border-slate-700/50 pt-1.5 text-[10px]">
                        <VoiceWaveform isActive={true} type="ai" barCount={4} />
                        <button
                          onClick={handleSkipVoice}
                          className="font-bold text-emerald-400 hover:underline tracking-wider uppercase"
                        >
                          Skip ⏭
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Live Transcript User Bubble */}
              {stt.isRecording && (
                <div className="flex justify-end animate-fade-in-up">
                  <div className="px-3 py-2 rounded-lg text-[13.5px] leading-relaxed max-w-[85%] bg-[#005c4b]/80 text-white rounded-tr-none shadow-sm flex flex-col gap-1.5 border border-emerald-500/20">
                    <div className="flex items-center gap-1.5 text-[9px] text-emerald-300 font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      {language === 'id' ? 'Mendengarkan...' : 'Listening...'}
                    </div>
                    <span className="italic">
                      {stt.transcript || (language === 'id' ? 'Mulai berbicara sekarang...' : 'Start speaking now...')}
                    </span>
                  </div>
                </div>
              )}
              
              {isWaitingForAI && (
                <div className="flex justify-start">
                  <div className="bg-[#202c33] px-3 py-2 rounded-lg rounded-tl-none text-[13.5px] text-slate-300 shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    <span className="italic">{language === 'id' ? 'AI mengetik…' : 'AI is typing...'}</span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Hint / Instructions Banner */}
        {hasStarted && currentHint && (
          <div className="shrink-0 bg-[#1f2c34] border-t border-slate-700 p-2.5 px-4 space-y-1.5">
            <div className="text-[12px] text-slate-300 bg-[#2a3942]/60 px-3 py-1.5 rounded border border-yellow-500/20">
              <span className="font-bold text-yellow-500">
                {language === 'id' ? '💡 Petunjuk: ' : '💡 Hint: '}
              </span>
              {currentHint}
            </div>
          </div>
        )}

        {/* Bottom Input Bar */}
        {hasStarted && (
          <div className="shrink-0 bg-[#1f2c34] px-3 py-3 flex items-center gap-2 border-t border-slate-700 pb-safe">
            {/* Audio Indicator / Controls for Mobile */}
            {tts.isSpeaking && (
              <button
                onClick={handleSkipVoice}
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shrink-0 animate-bounce shadow-md"
                title={language === 'id' ? "Lewati Suara AI" : "Skip AI Voice"}
              >
                <span className="text-sm">🔊</span>
              </button>
            )}
            {isWaitingForAI && (
              <div
                className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0"
                title="AI sedang berpikir"
              >
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              </div>
            )}
            {stt.isRecording && (
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                <VoiceWaveform isActive={true} type="user" barCount={4} />
              </div>
            )}

            <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-[13px] text-slate-300 truncate">
              {isRateLimited ? (
                <span className="text-red-400 font-medium animate-pulse">
                  {language === 'id' ? `⚠️ Model limit! Tunggu ${rateLimitCountdown} detik...` : `⚠️ Model limit! Wait ${rateLimitCountdown}s...`}
                </span>
              ) : stt.isRecording ? (
                <span className="text-emerald-400 animate-pulse font-medium">
                  {language === 'id' ? 'Sedang merekam suara Anda...' : 'Recording your voice...'}
                </span>
              ) : tts.isSpeaking ? (
                <span className="text-emerald-400 font-medium">
                  {language === 'id' ? 'AI sedang berbicara...' : 'AI is speaking...'}
                </span>
              ) : isWaitingForAI ? (
                <span className="text-amber-400 font-medium">
                  {language === 'id' ? 'Menyusun tanggapan...' : 'Composing response...'}
                </span>
              ) : (
                <span className="opacity-60">
                  {language === 'id' ? 'Tekan tombol mic di samping untuk bicara...' : 'Press the mic button next to this to speak...'}
                </span>
              )}
            </div>

            <button
              disabled={!isUserTurn || isWaitingForAI || isRateLimited}
              onClick={stt.isRecording ? () => { stt.stopRecording(); timer.stopSpeaking(); } : () => { stt.startRecording(); timer.startSpeaking(); }}
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center text-white transition-all shrink-0",
                stt.isRecording
                  ? "bg-red-600 animate-pulse shadow-lg scale-105"
                  : "bg-[#00a884] hover:bg-[#008f72] disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {stt.isRecording ? (
                <span className="text-lg">⏹️</span>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17.3 11c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP VIEW (hidden lg:flex) ── */}
      <div className="hidden lg:flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-[var(--color-hairline)] bg-[var(--color-surface-sidebar)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-base shrink-0"
              style={{ backgroundColor: 'rgba(58,134,255,0.15)', border: '1px solid rgba(58,134,255,0.3)' }}
            >
              🎙️
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[var(--color-ink)] truncate leading-tight">
                {scenario.title}
              </p>
              <p className="text-[11px] text-[var(--color-ink-muted)] leading-tight">
                {scenario.durationMinutes}m · {scenario.level}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)]">
              <div className="w-16 h-1.5 rounded-full bg-[var(--color-hairline)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                  style={{ width: `${turnProgress}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-[var(--color-ink-muted)] tabular-nums">
                {userTurnCount}/{MAX_USER_TURNS}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)]">
              <span className="text-[11px] text-[var(--color-ink-muted)]">⏱</span>
              <span className="text-[13px] font-bold text-[var(--color-ink)] tabular-nums">{elapsed}</span>
            </div>

            <button
              id="end-session-btn"
              onClick={handleEndSessionClick}
              title={language === 'id' ? 'Akhiri sesi' : 'End session'}
              className="flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--color-error)] hover:opacity-90 text-white text-[12px] font-semibold transition-opacity"
            >
              <EndCallIcon className="w-3.5 h-3.5" />
              <span>{language === 'id' ? 'Akhiri' : 'End'}</span>
            </button>
          </div>
        </div>

        {/* Desktop Main Grid */}
        <div className="flex-1 overflow-hidden flex flex-row gap-0">
          {/* LEFT: Avatar + Controls + Transcript */}
          <div className="flex flex-col lg:w-[45%] shrink-0 border-r border-[var(--color-hairline)]">
            {/* Avatar area */}
            <div
              className="relative flex items-center justify-center shrink-0 h-[100px] lg:h-[clamp(160px,28vh,260px)]"
              style={{
                backgroundColor: 'var(--color-avatar-area-bg)',
              }}
            >
              <div className="text-center">
                <div
                  className="text-4xl lg:text-7xl mb-1 lg:mb-2 transition-transform duration-300"
                  style={{ filter: tts.isSpeaking ? 'drop-shadow(0 0 16px rgba(58,134,255,0.6))' : 'none' }}
                >
                  👩‍🏫
                </div>
                {tts.isSpeaking && (
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-[var(--color-primary)]"
                        style={{
                          height: '12px',
                          animation: `waveBar 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Status badge */}
              <div className="absolute top-3 left-3">
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-full)] text-[11px] font-semibold',
                    isRateLimited
                      ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                      : isWaitingForAI
                      ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)] border border-[var(--color-warning)]/30'
                      : tts.isSpeaking
                      ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30'
                      : isUserTurn
                      ? 'bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30'
                      : 'bg-[var(--color-surface-card)] text-[var(--color-ink-muted)] border border-[var(--color-hairline)]'
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: isRateLimited ? '#ef4444' : isWaitingForAI ? '#f59e0b' : tts.isSpeaking ? '#3a86ff' : isUserTurn ? '#10b981' : '#6b7280' }}
                  />
                  {isRateLimited ? (language === 'id' ? `Sistem Sibuk (${rateLimitCountdown}s)` : `System Busy (${rateLimitCountdown}s)`)
                    : isWaitingForAI ? (language === 'id' ? 'AI Berpikir...' : 'AI Thinking…')
                    : tts.isSpeaking ? (language === 'id' ? 'AI Berbicara' : 'AI Speaking')
                    : isUserTurn ? (language === 'id' ? 'Giliran Anda' : 'Your Turn')
                    : (language === 'id' ? 'Menunggu' : 'Waiting')}
                </div>
              </div>

              {/* Skip AI speech */}
              {tts.isSpeaking && (
                <button
                  onClick={handleSkipVoice}
                  className="absolute bottom-3 right-3 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)] text-[11px] font-semibold text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] transition-colors"
                >
                  Skip ⏭
                </button>
              )}
            </div>

            {/* Controls row */}
            <div className="shrink-0 px-4 py-4 flex items-center justify-center gap-4 border-b border-[var(--color-hairline)] bg-[var(--color-surface-card)]">
              <button className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-surface-active)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] border border-[var(--color-hairline)] transition-colors" title="Toggle camera">
                <span className="text-lg">📹</span>
              </button>

              {hasStarted ? (
                <PushToTalkButton
                  isRecording={stt.isRecording}
                  disabled={!isUserTurn || isWaitingForAI || isRateLimited}
                  onStart={() => { stt.startRecording(); timer.startSpeaking(); }}
                  onStop={() => { stt.stopRecording(); timer.stopSpeaking(); }}
                />
              ) : (
                <Button variant="primary" size="lg" onClick={handleStart} id="start-session-btn">
                  {language === 'id' ? '🚀 Mulai Sesi' : '🚀 Start Session'}
                </Button>
              )}

              <button className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-surface-active)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] border border-[var(--color-hairline)] transition-colors" title="Toggle audio">
                <span className="text-lg">🎧</span>
              </button>
            </div>

            {/* Live transcript */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden max-h-[190px] lg:max-h-none shrink-0 lg:shrink">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12px] font-semibold text-[var(--color-ink-secondary)] uppercase tracking-[0.06em]">
                  {language === 'id' ? 'Transkrip Langsung' : 'Live Transcript'}
                </h3>
                {stt.isRecording && (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    {language === 'id' ? 'Merekam' : 'Recording'}
                  </span>
                )}
              </div>
              <div
                className="flex-1 rounded-[var(--radius-md)] p-3 border text-[13px] leading-relaxed font-medium overflow-y-auto"
                style={{
                  backgroundColor: 'var(--color-transcript-bg)',
                  borderColor: 'var(--color-hairline)',
                  color: 'var(--color-ink)',
                  minHeight: '80px',
                }}
              >
                {isRateLimited ? (
                  <span className="text-red-500 font-medium">
                    {language === 'id' ? `⚠️ Sistem sedang dalam limit. Mengulang ditunda. Silakan tunggu ${rateLimitCountdown} detik...` : `⚠️ System is rate-limited. Retrying is paused. Please wait ${rateLimitCountdown} seconds...`}
                  </span>
                ) : stt.transcript ? stt.transcript : (
                  <span className="text-[var(--color-ink-muted)] italic font-normal">
                    {isUserTurn
                      ? (language === 'id' ? 'Klik tombol mikrofon untuk berbicara...' : 'Click the mic button to speak…')
                      : (language === 'id' ? 'Menunggu giliran Anda...' : 'Waiting for your turn…')}
                  </span>
                )}
              </div>

              {currentHint && (
                <div
                  className="mt-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[12px] leading-relaxed border"
                  style={{
                    backgroundColor: 'var(--color-chat-hint-bg)',
                    borderColor: 'var(--color-chat-hint-border)',
                    color: 'var(--color-ink)',
                  }}
                >
                  <span className="font-semibold text-[var(--color-warning)]">
                    {language === 'id' ? '💡 Petunjuk: ' : '💡 Hint: '}
                  </span>
                  {currentHint}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Chat Log */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Chat header */}
            <div className="shrink-0 px-4 py-3 border-b border-[var(--color-hairline)] flex items-center justify-between bg-[var(--color-surface-card)]">
              <div>
                <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">
                  {language === 'id' ? 'Percakapan' : 'Conversation'}
                </h3>
                <p className="text-[11px] text-[var(--color-ink-muted)]">
                  {language === 'id' ? 'Obrolan bertenaga AI' : 'AI-powered chat'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-full)] bg-[var(--color-surface-active)] border border-[var(--color-hairline)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                <span className="text-[11px] font-semibold text-[var(--color-ink-secondary)]">
                  {language === 'id' ? 'Aktif' : 'Online'}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!hasStarted ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
                  <div className="text-4xl">🎙️</div>
                  <div>
                    <p className="text-[15px] font-semibold text-[var(--color-ink)] mb-1">
                      {language === 'id' ? 'Siap untuk Latihan?' : 'Ready to Practice?'}
                    </p>
                    <p className="text-[12px] text-[var(--color-ink-muted)] max-w-[200px]">
                      {language === 'id' ? 'Tekan Mulai untuk memulai sesi percakapan AI Anda.' : 'Press Start to begin your AI conversation session.'}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-2.5 animate-fade-in-up',
                      msg.speaker === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                      style={{
                        backgroundColor: msg.speaker === 'ai'
                          ? 'var(--color-surface-active)'
                          : 'var(--color-primary)',
                      }}
                    >
                      {msg.speaker === 'ai' ? '🤖' : '👤'}
                    </div>

                    <div
                      className={cn(
                        'px-3.5 py-2.5 rounded-[var(--radius-lg)] text-[13px] leading-relaxed max-w-[80%]',
                        msg.speaker === 'ai' ? 'rounded-tl-[4px]' : 'rounded-tr-[4px]'
                      )}
                      style={msg.speaker === 'ai' ? {
                        backgroundColor: 'var(--color-chat-ai-bg)',
                        border: '1px solid var(--color-chat-ai-border)',
                        color: 'var(--color-chat-ai-text)',
                      } : {
                        backgroundColor: 'var(--color-chat-user-bg)',
                        color: 'var(--color-chat-user-text)',
                      }}
                    >
                      {msg.isTyping ? (
                        <div className="flex items-center gap-1 py-0.5">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: 'var(--color-ink-muted)',
                                animation: `waveBar 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
                              }}
                            />
                          ))}
                        </div>
                      ) : msg.speaker === 'ai' ? (
                        // AI messages: words are clickable for dictionary lookup
                        <span>
                          {msg.text.split(/\s+/).map((word, wi) => (
                            <span
                              key={wi}
                              onClick={() => setSelectedWord(word)}
                              className="cursor-pointer hover:underline hover:opacity-80 transition-opacity"
                              title={language === 'id' ? `Cari arti "${word.replace(/[^a-zA-Z'-]/g, '')}"` : `Look up "${word.replace(/[^a-zA-Z'-]/g, '')}"`}
                            >
                              {word}{' '}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span>{msg.text}</span>
                      )}

                      {msg.speaker === 'ai' && !msg.isTyping && tts.isSpeaking &&
                        msg.id === messages.filter((m) => m.speaker === 'ai').at(-1)?.id && (
                        <div className="mt-2 flex items-center justify-between">
                          <VoiceWaveform isActive={true} type="ai" barCount={4} />
                          <button
                            onClick={handleSkipVoice}
                            className="text-[10px] uppercase font-bold text-[var(--color-primary)] hover:underline tracking-wider"
                          >
                            Skip ⏭
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isWaitingForAI && (
                <div className="flex gap-2.5 animate-fade-in-up">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 bg-[var(--color-surface-active)]">
                    🤖
                  </div>
                  <div
                    className="px-3.5 py-2.5 rounded-[var(--radius-lg)] rounded-tl-[4px] text-[13px]"
                    style={{
                      backgroundColor: 'var(--color-chat-ai-bg)',
                      border: '1px solid var(--color-chat-ai-border)',
                      color: 'var(--color-chat-ai-text)',
                    }}
                  >
                    <span className="italic text-[var(--color-ink-muted)]">
                      {language === 'id' ? 'Mengetik...' : 'Typing…'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EndCallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.01l-2.2 2.21z" />
    </svg>
  );
}
