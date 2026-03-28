import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  userBadges,
  fillUps,
  communityReports,
  shareTokens,
} from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth-utils";
import { calculateStreak, BADGE_MAP } from "@/lib/gamification";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const db = getDb();

  // Get current badges
  const badges = await db
    .select()
    .from(userBadges)
    .where(eq(userBadges.userId, user.id));

  const earnedTypes = new Set(badges.map((b) => b.badgeType));

  // Check for new badges to award
  const newBadges: string[] = [];

  // Fill-up stats
  const fillUpStats = await db
    .select({
      count: sql<number>`COUNT(*)`,
      totalSaved: sql<number>`COALESCE(SUM(${fillUps.savedVsAverage}), 0)`,
      uniqueStations: sql<number>`COUNT(DISTINCT ${fillUps.stationId})`,
    })
    .from(fillUps)
    .where(eq(fillUps.userId, user.id));

  const stats = fillUpStats[0];

  // Fill-up badges
  if (stats.count >= 1 && !earnedTypes.has("first_fillup")) {
    newBadges.push("first_fillup");
  }
  if (stats.totalSaved >= 10 && !earnedTypes.has("saver_10")) {
    newBadges.push("saver_10");
  }
  if (stats.totalSaved >= 50 && !earnedTypes.has("saver_50")) {
    newBadges.push("saver_50");
  }
  if (stats.totalSaved >= 100 && !earnedTypes.has("saver_100")) {
    newBadges.push("saver_100");
  }
  if (stats.uniqueStations >= 5 && !earnedTypes.has("explorer_5")) {
    newBadges.push("explorer_5");
  }

  // Report badges
  const reportStats = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(communityReports)
    .where(eq(communityReports.userId, user.id));

  const reportCount = reportStats[0]?.count ?? 0;
  if (reportCount >= 1 && !earnedTypes.has("reporter_1")) {
    newBadges.push("reporter_1");
  }
  if (reportCount >= 10 && !earnedTypes.has("reporter_10")) {
    newBadges.push("reporter_10");
  }
  if (reportCount >= 50 && !earnedTypes.has("reporter_50")) {
    newBadges.push("reporter_50");
  }

  // Streak badges
  const fillUpDates = await db
    .select({ date: fillUps.filledAt })
    .from(fillUps)
    .where(eq(fillUps.userId, user.id));

  const streak = calculateStreak(fillUpDates.map((f) => f.date));
  if (streak >= 3 && !earnedTypes.has("streak_3")) {
    newBadges.push("streak_3");
  }
  if (streak >= 7 && !earnedTypes.has("streak_7")) {
    newBadges.push("streak_7");
  }

  // Share badge
  const shareStats = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(shareTokens);
  // Note: in a real app, we'd track shares per user
  if (shareStats[0]?.count >= 1 && !earnedTypes.has("sharer_1")) {
    newBadges.push("sharer_1");
  }

  // Award new badges
  const now = new Date().toISOString();
  for (const badgeType of newBadges) {
    await db.insert(userBadges).values({
      userId: user.id,
      badgeType,
      earnedAt: now,
    });
  }

  // Return all badges (existing + newly awarded)
  const allBadges = [
    ...badges.map((b) => ({
      type: b.badgeType,
      earnedAt: b.earnedAt,
      ...BADGE_MAP.get(b.badgeType),
    })),
    ...newBadges.map((type) => ({
      type,
      earnedAt: now,
      isNew: true,
      ...BADGE_MAP.get(type),
    })),
  ];

  return NextResponse.json({
    badges: allBadges,
    streak,
    stats: {
      fillUps: stats.count,
      totalSaved: Math.round(stats.totalSaved * 100) / 100,
      uniqueStations: stats.uniqueStations,
      reports: reportCount,
    },
  });
}
