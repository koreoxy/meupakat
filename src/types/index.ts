// src/types/index.ts
// Central type definitions for Meupakat app

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id: string;
  fullName: string;
  email: string;
  currentLevel: UserLevel;
  currentXp: number;
  dailyTargetMinutes: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface DailyProgress {
  id: string;
  userId: string;
  date: string;
  minutesSpoken: number;
  secondsSpoken: number;
  isMissionCompleted: boolean;
}

export interface Scenario {
  id: string;
  level: UserLevel;
  title: string;
  description: string;
  context: string;
  turns: ConversationTurn[];
  xpReward: number;
  durationMinutes: number;
}

export interface ConversationTurn {
  id: string;
  speaker: 'ai' | 'user';
  text: string;
  hint?: string;
  expectedKeywords?: string[];
}

export interface DynamicChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatAIResponse {
  reply: string;
  hintForUser: string;
}

export interface AppState {
  user: User | null;
  streak: Streak | null;
  todayProgress: DailyProgress | null;
  weeklyProgress: DailyProgress[];
  isLoading: boolean;
}

export type LevelInfo = {
  level: UserLevel;
  label: string;
  emoji: string;
  color: string;
  xpRequired: number;
  xpNext: number;
};

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number;
}
