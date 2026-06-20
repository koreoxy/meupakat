// src/db/schema.ts
// Drizzle ORM schema — sesuai PRD TalkRoute
// Setiap perubahan di file ini harus diikuti dengan: npx drizzle-kit push

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ─── Enum ─────────────────────────────────────────────────────────────────────

export const userLevelEnum = pgEnum('user_level', [
  'beginner',
  'intermediate',
  'advanced',
]);

export const missionTypeEnum = pgEnum('mission_type', [
  'speak_time',
  'vocab_lookup',
  'complete_session',
  'perfect_score',
  'streak_day',
]);

export const speakingMaterialTypeEnum = pgEnum('speaking_material_type', [
  'quote',
  'movie_script',
  'song_lyrics',
]);

// ─── Users ────────────────────────────────────────────────────────────────────
// Tersinkronisasi dengan auth.users Supabase via trigger (lihat migrations/rls.sql)

export const users = pgTable('users', {
  /** UUID dari Supabase auth.users.id */
  id: uuid('id').primaryKey().notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  currentLevel: userLevelEnum('current_level').default('beginner').notNull(),
  currentXp: integer('current_xp').default(0).notNull(),
  weeklyXp: integer('weekly_xp').default(0).notNull(),
  dailyTargetMinutes: integer('daily_target_minutes').default(10).notNull(),
  nextDailyTargetMinutes: integer('next_daily_target_minutes').default(10).notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Streaks ──────────────────────────────────────────────────────────────────

export const streaks = pgTable('streaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastActiveDate: timestamp('last_active_date', { withTimezone: true }),
});

// ─── Daily Progress ───────────────────────────────────────────────────────────

export const dailyProgress = pgTable('daily_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  /** ISO date-only string: 'yyyy-MM-dd' */
  date: text('date').notNull(),
  minutesSpoken: integer('minutes_spoken').default(0).notNull(),
  secondsSpoken: integer('seconds_spoken').default(0).notNull(),
  xpEarned: integer('xp_earned').default(0).notNull(),
  isMissionCompleted: boolean('is_mission_completed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── User Vocabularies (Bookmarked Words) ─────────────────────────────────────

export const userVocabularies = pgTable('user_vocabularies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  word: text('word').notNull(),
  phonetic: text('phonetic'),
  partOfSpeech: text('part_of_speech'),
  definition: text('definition').notNull(),
  example: text('example'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Daily Mission Definitions (Library) ─────────────────────────────────────

export const dailyMissionDefs = pgTable('daily_mission_defs', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: missionTypeEnum('type').notNull(),
  targetValue: integer('target_value').notNull(),
  xpReward: integer('xp_reward').notNull(),
  icon: text('icon').notNull().default('🎯'),
});

// ─── User Daily Missions (Progress per User per Day) ─────────────────────────

export const userDailyMissions = pgTable('user_daily_missions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  missionDefId: uuid('mission_def_id')
    .notNull()
    .references(() => dailyMissionDefs.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  currentValue: integer('current_value').default(0).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  isClaimed: boolean('is_claimed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Speaking Materials ───────────────────────────────────────────────────────

export const speakingMaterials = pgTable('speaking_materials', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: speakingMaterialTypeEnum('type').notNull(),
  content: text('content').notNull(),
  translation: text('translation'),
  source: text('source').notNull(),
  difficulty: userLevelEnum('difficulty').default('beginner').notNull(),
  xpReward: integer('xp_reward').default(15).notNull(),
  audioUrl: text('audio_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Type exports (inferred from schema) ─────────────────────────────────────

export type DbUser = typeof users.$inferSelect;
export type DbUserInsert = typeof users.$inferInsert;
export type DbStreak = typeof streaks.$inferSelect;
export type DbStreakInsert = typeof streaks.$inferInsert;
export type DbDailyProgress = typeof dailyProgress.$inferSelect;
export type DbDailyProgressInsert = typeof dailyProgress.$inferInsert;
export type DbUserVocab = typeof userVocabularies.$inferSelect;
export type DbUserVocabInsert = typeof userVocabularies.$inferInsert;
export type DbMissionDef = typeof dailyMissionDefs.$inferSelect;
export type DbUserDailyMission = typeof userDailyMissions.$inferSelect;
export type DbSpeakingMaterial = typeof speakingMaterials.$inferSelect;
export type DbSpeakingMaterialInsert = typeof speakingMaterials.$inferInsert;
