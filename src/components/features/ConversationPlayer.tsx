'use client';
// src/components/features/ConversationPlayer.tsx
// Responsive AI conversation player — dark/light mode aware

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import type { Scenario, DynamicChatMessage, ChatAIResponse } from '@/types';
import { useTTS, useSTT } from '@/hooks/useSpeechServices';
import { useSmartTimer } from '@/hooks/useSmartTimer';
import { useToast } from '@/components/ui/Toast';
import PushToTalkButton from './PushToTalkButton';
import VoiceWaveform from './VoiceWaveform';
import Button from '@/components/ui/Button';

interface ConversationPlayerProps {
  scenario: Scenario;
  onComplete: (minutesSpoken: number) => void;
}

interface ChatMessage {
  id: string;
  speaker: 'ai' | 'user';
  text: string;
  isTyping?: boolean;
}

const MAX_USER_TURNS = 5;

export default function ConversationPlayer({ scenario, onComplete }: ConversationPlayerProps) {
  const { showToast } = useToast();

  const [messages,       setMessages]       = useState<ChatMessage[]>([]);
  const [dynamicHistory, setDynamicHistory] = useState<DynamicChatMessage[]>([]);
  const [currentHint,    setCurrentHint]    = useState<string | undefined>('');
  const [userTurnCount,  setUserTurnCount]  = useState(0);
  const [isSessionDone,  setIsSessionDone]  = useState(false);
  const [hasStarted,     setHasStarted]     = useState(false);
  const [isUserTurn,     setIsUserTurn]     = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const targetSeconds = scenario.durationMinutes * 60;
  const timer = useSmartTimer({
    targetSeconds,
    onComplete: () => showToast('🎉 Daily target reached! Great job!', 'success', 5000),
  });

  const finishSessionRef = useRef<(() => void) | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWaitingForAI]);

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

  // ── STT ─────────────────────────────────────────────────────────────────────
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

      try {
        const msgId = crypto.randomUUID();
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
        showToast('Gagal terhubung ke AI. Silakan coba bicara lagi.', 'error');
        setIsWaitingForAI(false);
        setIsUserTurn(true);
      }
    },
    [dynamicHistory, scenario, timer, showToast, tts]
  );

  const stt = useSTT(handleSTTResult);

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

  const finishSession = useCallback(() => {
    tts.stop();
    timer.stopListening();
    timer.stopSpeaking();
    setIsSessionDone(true);
    const minutesSpoken = Math.max(1, Math.round(timer.elapsedSeconds / 60));
    setTimeout(() => onComplete(minutesSpoken), 600);
  }, [tts, timer, onComplete]);

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

  // Timer display
  const elapsed = `${Math.floor(timer.elapsedSeconds / 60)}:${(timer.elapsedSeconds % 60).toString().padStart(2, '0')}`;
  const turnProgress = Math.min(100, (userTurnCount / MAX_USER_TURNS) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-canvas)]">

      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-[var(--color-hairline)] bg-[var(--color-surface-sidebar)] flex items-center justify-between gap-4">
        {/* Scenario info */}
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
            <p className="text-[11px] text-[var(--color-ink-muted)] leading-tight hidden sm:block">
              {scenario.durationMinutes}min · {scenario.level}
            </p>
          </div>
        </div>

        {/* Timer + Turn progress + End button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Turn counter */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)]">
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

          {/* Elapsed time */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)]">
            <span className="text-[11px] text-[var(--color-ink-muted)]">⏱</span>
            <span className="text-[13px] font-bold text-[var(--color-ink)] tabular-nums">{elapsed}</span>
          </div>

          {/* End session */}
          <button
            id="end-session-btn"
            onClick={finishSession}
            title="End session"
            className="flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--color-error)] hover:opacity-90 text-white text-[12px] font-semibold transition-opacity"
          >
            <EndCallIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End</span>
          </button>
        </div>
      </div>

      {/* ── Main content — responsive grid ──────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-0">

        {/* ── LEFT: Avatar + Controls + Transcript ── */}
        <div className="flex flex-col lg:w-[45%] shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--color-hairline)]">

          {/* Avatar area */}
          <div
            className="relative flex items-center justify-center shrink-0"
            style={{
              height: 'clamp(160px, 28vh, 260px)',
              backgroundColor: 'var(--color-avatar-area-bg)',
            }}
          >
            {/* AI Avatar */}
            <div className="text-center">
              <div
                className="text-5xl sm:text-7xl mb-2 transition-transform duration-300"
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
                  isWaitingForAI
                    ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)] border border-[var(--color-warning)]/30'
                    : tts.isSpeaking
                    ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30'
                    : isUserTurn
                    ? 'bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30'
                    : 'bg-[var(--color-surface-card)] text-[var(--color-ink-muted)] border border-[var(--color-hairline)]'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: isWaitingForAI ? '#f59e0b' : tts.isSpeaking ? '#3a86ff' : isUserTurn ? '#10b981' : '#6b7280' }}
                />
                {isWaitingForAI ? 'AI Thinking…'
                  : tts.isSpeaking ? 'AI Speaking'
                  : isUserTurn ? 'Your Turn'
                  : 'Waiting'}
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
            {/* Mute / video placeholder */}
            <button className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-surface-active)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] border border-[var(--color-hairline)] transition-colors" title="Toggle camera">
              <span className="text-lg">📹</span>
            </button>

            {/* Push-to-talk */}
            {hasStarted ? (
              <PushToTalkButton
                isRecording={stt.isRecording}
                disabled={!isUserTurn || isWaitingForAI}
                onStart={() => { stt.startRecording(); timer.startSpeaking(); }}
                onStop={() => { stt.stopRecording(); timer.stopSpeaking(); }}
              />
            ) : (
              <Button variant="primary" size="lg" onClick={handleStart} id="start-session-btn">
                🚀 Start Session
              </Button>
            )}

            <button className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-surface-active)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] border border-[var(--color-hairline)] transition-colors" title="Toggle audio">
              <span className="text-lg">🎧</span>
            </button>
          </div>

          {/* Live transcript */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[12px] font-semibold text-[var(--color-ink-secondary)] uppercase tracking-[0.06em]">
                Live Transcript
              </h3>
              {stt.isRecording && (
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  Recording
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
              {stt.transcript ? stt.transcript : (
                <span className="text-[var(--color-ink-muted)] italic font-normal">
                  {isUserTurn ? 'Hold the mic button and speak…' : 'Waiting for your turn…'}
                </span>
              )}
            </div>

            {/* Hint */}
            {currentHint && (
              <div
                className="mt-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[12px] leading-relaxed border"
                style={{
                  backgroundColor: 'var(--color-chat-hint-bg)',
                  borderColor: 'var(--color-chat-hint-border)',
                  color: 'var(--color-ink)',
                }}
              >
                <span className="font-semibold text-[var(--color-warning)]">💡 Hint: </span>
                {currentHint}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Chat ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Chat header */}
          <div className="shrink-0 px-4 py-3 border-b border-[var(--color-hairline)] flex items-center justify-between bg-[var(--color-surface-card)]">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">Conversation</h3>
              <p className="text-[11px] text-[var(--color-ink-muted)]">AI-powered chat</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-full)] bg-[var(--color-surface-active)] border border-[var(--color-hairline)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
              <span className="text-[11px] font-semibold text-[var(--color-ink-secondary)]">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!hasStarted ? (
              /* Pre-start state */
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
                <div className="text-4xl">🎙️</div>
                <div>
                  <p className="text-[15px] font-semibold text-[var(--color-ink)] mb-1">Ready to Practice?</p>
                  <p className="text-[12px] text-[var(--color-ink-muted)] max-w-[200px]">
                    Press Start to begin your AI conversation session.
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
                  {/* Avatar */}
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

                  {/* Bubble */}
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
                    ) : (
                      <span>{msg.text}</span>
                    )}

                    {/* Skip voice for last AI message */}
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

            {/* AI thinking indicator */}
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
                  <span className="italic text-[var(--color-ink-muted)]">Typing…</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Icon ─────────────────────────────────────────────────────── */
function EndCallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.01l-2.2 2.21z" />
    </svg>
  );
}
