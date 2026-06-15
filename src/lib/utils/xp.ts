// src/lib/utils/xp.ts
// XP and leveling system utilities

import type { UserLevel, LevelInfo } from '@/types';

/** XP thresholds per level bracket */
export const LEVEL_BRACKETS: LevelInfo[] = [
  {
    level: 'beginner',
    label: 'Beginner',
    emoji: '🌱',
    color: '#10b981',
    xpRequired: 0,
    xpNext: 500,
  },
  {
    level: 'intermediate',
    label: 'Intermediate',
    emoji: '🚀',
    color: '#0ea5e9',
    xpRequired: 500,
    xpNext: 1500,
  },
  {
    level: 'advanced',
    label: 'Advanced',
    emoji: '⚡',
    color: '#8b5cf6',
    xpRequired: 1500,
    xpNext: 3000,
  },
];

/** XP awarded per mission based on level */
export const XP_PER_MISSION: Record<UserLevel, number> = {
  beginner: 50,
  intermediate: 80,
  advanced: 120,
};

/** XP awarded per minute spoken */
export const XP_PER_MINUTE = 10;

/**
 * Get the LevelInfo for a given XP amount.
 * Returns the highest bracket the user qualifies for.
 */
export function getLevelInfoByXp(xp: number): LevelInfo {
  let current = LEVEL_BRACKETS[0];
  for (const bracket of LEVEL_BRACKETS) {
    if (xp >= bracket.xpRequired) {
      current = bracket;
    } else {
      break;
    }
  }
  return current;
}

/**
 * Get the LevelInfo for a given level string.
 */
export function getLevelInfo(level: UserLevel): LevelInfo {
  return LEVEL_BRACKETS.find((b) => b.level === level) ?? LEVEL_BRACKETS[0];
}

/**
 * Calculate XP progress percentage within the current level.
 * Returns 0–100.
 */
export function getXpProgress(xp: number): number {
  const info = getLevelInfoByXp(xp);
  const range = info.xpNext - info.xpRequired;
  const current = xp - info.xpRequired;
  return Math.min(100, Math.round((current / range) * 100));
}

/**
 * Check if user leveled up given old and new XP.
 */
export function checkLevelUp(oldXp: number, newXp: number): boolean {
  const oldLevel = getLevelInfoByXp(oldXp);
  const newLevel = getLevelInfoByXp(newXp);
  return oldLevel.level !== newLevel.level;
}

/**
 * Calculate total XP earned from a mission session.
 */
export function calculateSessionXp(level: UserLevel, minutesSpoken: number): number {
  const missionXp = XP_PER_MISSION[level];
  const minuteXp = minutesSpoken * XP_PER_MINUTE;
  return missionXp + minuteXp;
}

/**
 * Format XP as readable string (e.g. "1,250 XP").
 */
export function formatXp(xp: number): string {
  return `${xp.toLocaleString()} XP`;
}
