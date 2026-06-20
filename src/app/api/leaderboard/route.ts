// src/app/api/leaderboard/route.ts
// Global Leaderboard API
// GET /api/leaderboard?period=daily|weekly|monthly|alltime

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/db';
import { users, dailyProgress } from '@/db/schema';
import { desc, eq, and, gte, sql } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { format, startOfWeek, startOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'weekly';

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  let rows;

  if (period === 'alltime') {
    rows = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        currentXp: users.currentXp,
        periodXp: users.currentXp,
        currentLevel: users.currentLevel,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .orderBy(desc(users.currentXp))
      .limit(50);
  } else {
    let startDate = todayStr;
    if (period === 'weekly') {
      startDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    } else if (period === 'monthly') {
      startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    }

    rows = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        currentXp: users.currentXp,
        periodXp: sql<number>`COALESCE(SUM(${dailyProgress.xpEarned}), 0)::int`,
        currentLevel: users.currentLevel,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .leftJoin(dailyProgress, and(
        eq(users.id, dailyProgress.userId),
        gte(dailyProgress.date, startDate)
      ))
      .groupBy(users.id)
      .orderBy(desc(sql`COALESCE(SUM(${dailyProgress.xpEarned}), 0)`))
      .limit(50);
  }

  const leaderboard = rows.map((u, idx) => ({
    rank: idx + 1,
    id: u.id,
    fullName: u.fullName,
    avatar: u.fullName ? u.fullName[0].toUpperCase() : '?',
    currentXp: u.currentXp,
    weeklyXp: u.periodXp,
    currentLevel: u.currentLevel,
    isCurrentUser: u.id === user.id,
  }));

  return NextResponse.json({ leaderboard });
}
