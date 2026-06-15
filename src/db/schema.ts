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

// ─── Users ────────────────────────────────────────────────────────────────────
// Tersinkronisasi dengan auth.users Supabase via trigger (lihat migrations/rls.sql)

export const users = pgTable('users', {
  /** UUID dari Supabase auth.users.id */
  id: uuid('id').primaryKey().notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  currentLevel: userLevelEnum('current_level').default('beginner').notNull(),
  currentXp: integer('current_xp').default(0).notNull(),
  dailyTargetMinutes: integer('daily_target_minutes').default(10).notNull(),
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
  isMissionCompleted: boolean('is_mission_completed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Type exports (inferred from schema) ─────────────────────────────────────

export type DbUser = typeof users.$inferSelect;
export type DbUserInsert = typeof users.$inferInsert;
export type DbStreak = typeof streaks.$inferSelect;
export type DbStreakInsert = typeof streaks.$inferInsert;
export type DbDailyProgress = typeof dailyProgress.$inferSelect;
export type DbDailyProgressInsert = typeof dailyProgress.$inferInsert;
