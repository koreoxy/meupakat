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
} from '@/app/actions/user';
import {
  getUserStreak,
  getTodayProgress,
  getWeeklyProgress,
  completeSession as serverCompleteSession,
} from '@/app/actions/progress';
import { logout as serverLogout } from '@/app/actions/auth';
import { useToast } from '@/components/ui/Toast';

// ─── State & Actions ─────────────────────────────────────────────────────────

interface AppState {
  user: User | null;
  streak: Streak | null;
  todayProgress: DailyProgress | null;
  weeklyProgress: DailyProgress[];
  isLoading: boolean;
  didLevelUp: boolean;
}

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_STREAK'; payload: Streak | null }
  | { type: 'SET_TODAY_PROGRESS'; payload: DailyProgress | null }
  | { type: 'SET_WEEKLY_PROGRESS'; payload: DailyProgress[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LEVEL_UP'; payload: boolean }
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
};

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue extends AppState {
  refreshData: () => Promise<void>;
  login: (email: string, fullName: string, level: User['currentLevel']) => void; // deprecated, auth is via pages now
  logout: () => Promise<void>;
  updateDailyTarget: (minutes: number) => Promise<void>;
  completeSession: (minutesSpoken: number) => { didLevelUp: boolean; xpGained: number };
  dismissLevelUp: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { showToast } = useToast();

  const refreshData = useCallback(async () => {
    try {
      const [user, streak, today, weekly] = await Promise.all([
        getUserProfile(),
        getUserStreak(),
        getTodayProgress(),
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
      const res = await serverUpdateDailyTarget(minutes);
      if (res.success) {
        await refreshData();
      } else {
        showToast(res.error || 'Gagal mengubah target', 'error');
      }
    },
    [refreshData, showToast]
  );

  const completeSession = useCallback(
    (minutesSpoken: number): { didLevelUp: boolean; xpGained: number } => {
      // In a real app this is tricky to make purely synchronous if the DB update takes time, 
      // but to preserve the existing UI behavior we will return a temporary mock object
      // while we dispatch the server action asynchronously.
      // Alternatively, we let the UI wait for the result.
      // Since the interface requires a synchronous return (based on current usages), we will do this:

      // Execute asynchronously
      serverCompleteSession(minutesSpoken).then((res) => {
        if (res.success) {
          if (res.didLevelUp) {
            dispatch({ type: 'SET_LEVEL_UP', payload: true });
          }
          refreshData();
        }
      });

      // Temporary return, the real UI updates when refreshData finishes
      return { didLevelUp: false, xpGained: 0 }; 
    },
    [refreshData]
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
