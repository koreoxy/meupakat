'use client';
// src/app/dashboard/mission/[scenarioId]/page.tsx

import { use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getScenarioById } from '@/lib/scenarios';
import { useAppStore } from '@/hooks/useAppStore';
import { useToast } from '@/components/ui/Toast';
import ConversationPlayer from '@/components/features/ConversationPlayer';
import { getLevelInfoByXp } from '@/lib/utils/xp';

interface PageProps {
  params: Promise<{ scenarioId: string }>;
}

export default function MissionPage({ params }: PageProps) {
  const { scenarioId } = use(params);
  const router = useRouter();
  const { user, completeSession } = useAppStore();
  const { showToast } = useToast();
  const [isDone, setIsDone] = useState(false);
  const [result, setResult] = useState<{ xpGained: number; didLevelUp: boolean } | null>(null);

  const scenario = getScenarioById(scenarioId);

  if (!scenario) {
    return (
      <div className="min-h-full bg-[var(--color-canvas)] flex flex-col items-center justify-center px-4 py-16">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-[var(--color-ink)] font-semibold text-xl mb-2">Scenario not found</h2>
        <Link href="/dashboard/practice" className="text-[var(--color-primary)] text-sm hover:underline">
          ← Back to Practice
        </Link>
      </div>
    );
  }

  const levelInfo = user ? getLevelInfoByXp(user.currentXp) : null;

  const handleComplete = useCallback(
    async (secondsSpoken: number, aiPerformanceScore: number) => {
      const res = await completeSession(secondsSpoken, aiPerformanceScore);
      setResult({ xpGained: res.xpGained, didLevelUp: res.didLevelUp });
      setIsDone(true);
      showToast(`🎉 +${res.xpGained} XP earned! Great session!`, 'success', 4000);
    },
    [completeSession, showToast]
  );

  return (
    <div className="h-full flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans overflow-hidden">
      <div className="flex-1 overflow-hidden flex flex-col">
        {!isDone ? (
          <ConversationPlayer scenario={scenario} onComplete={handleComplete} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center animate-scale-in">

            <div className="text-6xl mb-5">🏆</div>
            <h2 className="font-display-md text-[var(--color-ink)] mb-2">Session Complete!</h2>
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-8 leading-relaxed max-w-xs">
              You finished <strong className="text-[var(--color-ink)]">{scenario.title}</strong>.{' '}
              Keep it up!
            </p>

            {result && (
              <div className="w-full max-w-sm bg-[var(--color-surface-card)] border border-[var(--color-hairline)] rounded-[var(--radius-xl)] p-5 mb-8">
                <div className="flex justify-around">
                  <div className="text-center">
                    <p className="text-2xl font-black text-[var(--color-primary)]">+{result.xpGained}</p>
                    <p className="text-[11px] text-[var(--color-ink-muted)] mt-1 font-medium">XP Earned</p>
                  </div>
                  <div className="w-px bg-[var(--color-hairline)]" />
                  <div className="text-center">
                    <p className="text-2xl">🔥</p>
                    <p className="text-[11px] text-[var(--color-ink-muted)] mt-1 font-medium">Streak Active</p>
                  </div>
                  <div className="w-px bg-[var(--color-hairline)]" />
                  <div className="text-center">
                    <p className="text-2xl text-emerald-400">✓</p>
                    <p className="text-[11px] text-[var(--color-ink-muted)] mt-1 font-medium">Mission Done</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button
                id="practice-again-btn"
                onClick={() => { setIsDone(false); setResult(null); }}
                className="w-full h-11 rounded-[var(--radius-sm)] text-[14px] font-semibold text-[var(--color-on-primary)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors active:scale-[0.98]"
              >
                🔄 Practice Again
              </button>
              <button
                id="go-to-dashboard-btn"
                onClick={() => router.push('/dashboard')}
                className="w-full h-11 rounded-[var(--radius-sm)] text-[14px] font-medium text-[var(--color-ink-secondary)] bg-[var(--color-surface-card)] border border-[var(--color-hairline)] hover:border-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors active:scale-[0.98]"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
