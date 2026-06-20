// src/lib/utils/xp.ts
// Valorant-style Rank and XP leveling system utilities

import type { UserLevel, LevelInfo } from '@/types';

export interface ValorantRankInfo {
  main: string;
  sub: number;
  label: string;
  emoji: string;
  color: string;
  xpRequired: number;
  xpNext: number;
}

// 22 Rank Levels (Iron 1-3 to Radiant)
export const VALORANT_RANKS: ValorantRankInfo[] = [
  // Iron (0 - 450)
  { main: 'Iron', sub: 1, label: 'Iron 1', emoji: '⚙️', color: '#9ca3af', xpRequired: 0, xpNext: 100 },
  { main: 'Iron', sub: 2, label: 'Iron 2', emoji: '⚙️', color: '#9ca3af', xpRequired: 100, xpNext: 250 },
  { main: 'Iron', sub: 3, label: 'Iron 3', emoji: '⚙️', color: '#9ca3af', xpRequired: 250, xpNext: 450 },
  // Bronze (451 - 1350)
  { main: 'Bronze', sub: 1, label: 'Bronze 1', emoji: '🪵', color: '#b45309', xpRequired: 450, xpNext: 700 },
  { main: 'Bronze', sub: 2, label: 'Bronze 2', emoji: '🪵', color: '#b45309', xpRequired: 700, xpNext: 1000 },
  { main: 'Bronze', sub: 3, label: 'Bronze 3', emoji: '🪵', color: '#b45309', xpRequired: 1000, xpNext: 1350 },
  // Silver (1351 - 2700)
  { main: 'Silver', sub: 1, label: 'Silver 1', emoji: '🥈', color: '#6b7280', xpRequired: 1350, xpNext: 1750 },
  { main: 'Silver', sub: 2, label: 'Silver 2', emoji: '🥈', color: '#6b7280', xpRequired: 1750, xpNext: 2200 },
  { main: 'Silver', sub: 3, label: 'Silver 3', emoji: '🥈', color: '#6b7280', xpRequired: 2200, xpNext: 2700 },
  // Gold (2701 - 4800)
  { main: 'Gold', sub: 1, label: 'Gold 1', emoji: '🥇', color: '#fbbf24', xpRequired: 2700, xpNext: 3300 },
  { main: 'Gold', sub: 2, label: 'Gold 2', emoji: '🥇', color: '#fbbf24', xpRequired: 3300, xpNext: 4000 },
  { main: 'Gold', sub: 3, label: 'Gold 3', emoji: '🥇', color: '#fbbf24', xpRequired: 4000, xpNext: 4800 },
  // Platinum (4801 - 8400)
  { main: 'Platinum', sub: 1, label: 'Platinum 1', emoji: '💎', color: '#38bdf8', xpRequired: 4800, xpNext: 5800 },
  { main: 'Platinum', sub: 2, label: 'Platinum 2', emoji: '💎', color: '#38bdf8', xpRequired: 5800, xpNext: 7000 },
  { main: 'Platinum', sub: 3, label: 'Platinum 3', emoji: '💎', color: '#38bdf8', xpRequired: 7000, xpNext: 8400 },
  // Diamond (8401 - 14400)
  { main: 'Diamond', sub: 1, label: 'Diamond 1', emoji: '🔮', color: '#818cf8', xpRequired: 8400, xpNext: 10100 },
  { main: 'Diamond', sub: 2, label: 'Diamond 2', emoji: '🔮', color: '#818cf8', xpRequired: 10100, xpNext: 12100 },
  { main: 'Diamond', sub: 3, label: 'Diamond 3', emoji: '🔮', color: '#818cf8', xpRequired: 12100, xpNext: 14400 },
  // Immortal (14401 - 23700)
  { main: 'Immortal', sub: 1, label: 'Immortal 1', emoji: '🪐', color: '#ec4899', xpRequired: 14400, xpNext: 17100 },
  { main: 'Immortal', sub: 2, label: 'Immortal 2', emoji: '🪐', color: '#ec4899', xpRequired: 17100, xpNext: 20200 },
  { main: 'Immortal', sub: 3, label: 'Immortal 3', emoji: '🪐', color: '#ec4899', xpRequired: 20200, xpNext: 23700 },
  // Radiant (23701+)
  { main: 'Radiant', sub: 0, label: 'Radiant', emoji: '🌟', color: '#f43f5e', xpRequired: 23700, xpNext: 28700 }
];

/**
 * Get core Level category ('beginner' | 'intermediate' | 'advanced') based on XP
 */
export function getLevelCategory(xp: number): UserLevel {
  if (xp >= 4800) return 'advanced';
  if (xp >= 1350) return 'intermediate';
  return 'beginner';
}

/**
 * Get the LevelInfo (for UI rendering) for a given XP amount.
 */
export function getLevelInfoByXp(xp: number): LevelInfo {
  // Find matching rank from VALORANT_RANKS
  let currentRank = VALORANT_RANKS[0];
  for (const rank of VALORANT_RANKS) {
    if (xp >= rank.xpRequired) {
      currentRank = rank;
    } else {
      break;
    }
  }

  // Map to core user level
  const coreLevel = getLevelCategory(xp);

  return {
    level: coreLevel,
    label: currentRank.label,
    emoji: currentRank.emoji,
    color: currentRank.color,
    xpRequired: currentRank.xpRequired,
    xpNext: currentRank.xpNext,
  };
}

/**
 * Get the LevelInfo for a given level category.
 * Used for fallback compatibility.
 */
export function getLevelInfo(level: UserLevel): LevelInfo {
  if (level === 'advanced') {
    return getLevelInfoByXp(4800); // Platinum 1
  }
  if (level === 'intermediate') {
    return getLevelInfoByXp(1350); // Silver 1
  }
  return getLevelInfoByXp(0); // Iron 1
}

/**
 * Calculate XP progress percentage within the current sub-rank.
 * Returns 0–100.
 */
export function getXpProgress(xp: number): number {
  const info = getLevelInfoByXp(xp);
  const range = info.xpNext - info.xpRequired;
  const current = xp - info.xpRequired;
  return Math.min(100, Math.round((current / range) * 100));
}

/**
 * Check if user leveled up (changed sub-rank) given old and new XP.
 */
export function checkLevelUp(oldXp: number, newXp: number): boolean {
  const oldRank = getLevelInfoByXp(oldXp);
  const newRank = getLevelInfoByXp(newXp);
  return oldRank.label !== newRank.label;
}

/**
 * Calculate total XP earned from a session using the new formula:
 * XP = Base XP (50) + (Streak * 2) + AI Performance Score (0-30)
 */
export function calculateSessionXp(streakCount: number, aiPerformanceScore: number): number {
  const base = 50;
  const streakBonus = streakCount * 2;
  const aiScore = Math.min(30, Math.max(0, aiPerformanceScore));
  return base + streakBonus + aiScore;
}

/**
 * Format XP as readable string (e.g. "1,250 XP").
 */
export function formatXp(xp: number): string {
  return `${xp.toLocaleString()} XP`;
}

/**
 * Get dynamic system prompt instructions based on user's rank / XP
 */
export function getDifficultyInstructions(xp: number): string {
  if (xp >= 14400) {
    // Immortal / Radiant
    return `You are speaking to an Advanced/Fluent learner at an Immortal/Radiant rank.
INSTRUCTIONS:
1. Speak like a native English speaker using high-level idiomatic expressions, modern slang, and natural speed.
2. Challenge their arguments, ask rhetorical questions, and politely debate their opinions.
3. Encourage critical thinking and push them to use advanced vocabulary.`;
  }
  if (xp >= 4800) {
    // Platinum / Diamond
    return `You are speaking to an Upper-Intermediate learner at a Platinum/Diamond rank.
INSTRUCTIONS:
1. Use formal, professional, or academic English appropriate for the context.
2. Use complex sentences, upper-intermediate/advanced vocabulary (B2/C1), and logical arguments.
3. Challenge the user to explain their views clearly.`;
  }
  if (xp >= 1350) {
    // Silver / Gold
    return `You are speaking to an Intermediate learner at a Silver/Gold rank.
INSTRUCTIONS:
1. Use casual, everyday conversational English at a normal pace.
2. Blend in common idioms and basic phrasal verbs.
3. In the hint, provide natural alternative ways they could phrase their response.`;
  }
  // Iron / Bronze (0 - 1349)
  return `You are speaking to a Beginner learner at an Iron/Bronze rank.
INSTRUCTIONS:
1. Use very simple, slow-paced English, short sentences, and basic vocabulary.
2. If the user makes a basic grammar mistake, gently point it out and provide a friendly correction at the very beginning of your reply, then continue the conversation.`;
}
