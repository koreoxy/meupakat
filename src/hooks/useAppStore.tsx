'use client';
// src/hooks/useAppStore.tsx
// Global application state using React Context + useReducer + Server Actions

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Streak, DailyProgress } from '@/types';
import {
  getUserProfile,
  updateDailyTarget as serverUpdateDailyTarget,
  type UpdateTargetResult,
} from '@/app/actions/user';
import {
  getUserStreak,
  getTodayProgress,
  getWeeklyProgress,
  completeSession as serverCompleteSession,
  completeSpeakingCardAction as serverCompleteSpeakingCardAction,
} from '@/app/actions/progress';
import { logout as serverLogout } from '@/app/actions/auth';
import { useToast } from '@/components/ui/Toast';
import { format } from 'date-fns';

// ─── State & Actions ─────────────────────────────────────────────────────────

interface AppState {
  user: User | null;
  streak: Streak | null;
  todayProgress: DailyProgress | null;
  weeklyProgress: DailyProgress[];
  isLoading: boolean;
  didLevelUp: boolean;
  justCompletedMission: boolean;
}

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_STREAK'; payload: Streak | null }
  | { type: 'SET_TODAY_PROGRESS'; payload: DailyProgress | null }
  | { type: 'SET_WEEKLY_PROGRESS'; payload: DailyProgress[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LEVEL_UP'; payload: boolean }
  | { type: 'SET_JUST_COMPLETED_MISSION'; payload: boolean }
  | { type: 'LOGOUT' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_STREAK':
      return { ...state, streak: action.payload };
    case 'SET_TODAY_PROGRESS':
      return { ...state, todayProgress: action.payload };
    case 'SET_WEEKLY_PROGRESS':
      return { ...state, weeklyProgress: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LEVEL_UP':
      return { ...state, didLevelUp: action.payload };
    case 'SET_JUST_COMPLETED_MISSION':
      return { ...state, justCompletedMission: action.payload };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

const initialState: AppState = {
  user: null,
  streak: null,
  todayProgress: null,
  weeklyProgress: [],
  isLoading: true,
  didLevelUp: false,
  justCompletedMission: false,
};

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue extends AppState {
  refreshData: () => Promise<void>;
  login: (email: string, fullName: string, level: User['currentLevel']) => void; // deprecated, auth is via pages now
  logout: () => Promise<void>;
  updateDailyTarget: (minutes: number) => Promise<UpdateTargetResult>;
  completeSession: (secondsSpoken: number, aiPerformanceScore: number) => Promise<{ didLevelUp: boolean; xpGained: number; isMissionCompleted: boolean; newStreak: number }>;
  completeSpeakingCard: (materialId: string) => Promise<{ success: boolean; xpGained: number; didLevelUp: boolean; isMissionCompleted: boolean; newStreak: number }>;
  dismissLevelUp: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { showToast } = useToast();

  const refreshData = useCallback(async () => {
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const [user, streak, today, weekly] = await Promise.all([
        getUserProfile(),
        getUserStreak(),
        getTodayProgress(todayStr),
        getWeeklyProgress(),
      ]);

      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_STREAK', payload: streak });
      dispatch({ type: 'SET_TODAY_PROGRESS', payload: today });
      dispatch({ type: 'SET_WEEKLY_PROGRESS', payload: weekly });
    } catch (err) {
      console.error('Failed to refresh data', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Deprecated in real app, but kept for compatibility with mock pages that haven't been migrated yet
  const login = useCallback(
    (email: string, fullName: string, level: User['currentLevel']) => {
      console.warn('login() in AppStore is deprecated. Use Server Actions.');
    },
    []
  );

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await serverLogout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateDailyTarget = useCallback(
    async (minutes: number) => {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const res = await serverUpdateDailyTarget(minutes, todayStr);
      if (res.success) {
        await refreshData();
      } else {
        showToast(res.error || 'Gagal mengubah target', 'error');
      }
      return res;
    },
    [refreshData, showToast]
  );

  const completeSession = useCallback(
    async (secondsSpoken: number, aiPerformanceScore: number): Promise<{ didLevelUp: boolean; xpGained: number; isMissionCompleted: boolean; newStreak: number }> => {
      try {
        const wasMissionDoneBefore = state.todayProgress?.isMissionCompleted ?? false;
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const res = await serverCompleteSession(secondsSpoken, aiPerformanceScore, todayStr);
        if (res.success) {
          if (res.didLevelUp) {
            dispatch({ type: 'SET_LEVEL_UP', payload: true });
          }
          if (!wasMissionDoneBefore && res.isMissionCompleted) {
            dispatch({ type: 'SET_JUST_COMPLETED_MISSION', payload: true });
            setTimeout(() => {
              dispatch({ type: 'SET_JUST_COMPLETED_MISSION', payload: false });
            }, 6000);
          }
          await refreshData();
          return {
            didLevelUp: res.didLevelUp,
            xpGained: res.xpGained,
            isMissionCompleted: res.isMissionCompleted,
            newStreak: res.newStreak,
          };
        }
      } catch (err) {
        console.error('Error completing session in store:', err);
      }
      return { didLevelUp: false, xpGained: 0, isMissionCompleted: false, newStreak: 0 };
    },
    [refreshData, state.todayProgress]
  );

  const completeSpeakingCard = useCallback(
    async (materialId: string): Promise<{ success: boolean; xpGained: number; didLevelUp: boolean; isMissionCompleted: boolean; newStreak: number }> => {
      try {
        const wasMissionDoneBefore = state.todayProgress?.isMissionCompleted ?? false;
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const res = await serverCompleteSpeakingCardAction(materialId, todayStr);
        if (res.success) {
          if (!wasMissionDoneBefore && res.isMissionCompleted) {
            dispatch({ type: 'SET_JUST_COMPLETED_MISSION', payload: true });
            setTimeout(() => {
              dispatch({ type: 'SET_JUST_COMPLETED_MISSION', payload: false });
            }, 6000);
          }
          await refreshData();
          return res;
        }
      } catch (err) {
        console.error('Error completing speaking card in store:', err);
      }
      return { success: false, xpGained: 0, didLevelUp: false, isMissionCompleted: false, newStreak: 0 };
    },
    [refreshData, state.todayProgress]
  );

  const dismissLevelUp = useCallback(() => {
    dispatch({ type: 'SET_LEVEL_UP', payload: false });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        refreshData,
        login,
        logout,
        updateDailyTarget,
        completeSession,
        completeSpeakingCard,
        dismissLevelUp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAppStore(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
