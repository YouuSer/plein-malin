import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { communityReports, user as userTable } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth-utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const stationId = url.searchParams.get("stationId");

  if (!stationId) {
    return NextResponse.json({ error: "stationId requis" }, { status: 400 });
  }

  const db = getDb();

  const reports = await db
    .select({
      id: communityReports.id,
      reportType: communityReports.reportType,
      fuelType: communityReports.fuelType,
      reportedPrice: communityReports.reportedPrice,
      comment: communityReports.comment,
      createdAt: communityReports.createdAt,
      userName: userTable.name,
    })
    .from(communityReports)
    .leftJoin(userTable, eq(communityReports.userId, userTable.id))
    .where(eq(communityReports.stationId, stationId))
    .orderBy(desc(communityReports.createdAt))
    .limit(20);

  // Count confirmations in last 24h
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const confirmCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(communityReports)
    .where(
      sql`${communityReports.stationId} = ${stationId} AND ${communityReports.reportType} = 'price_confirm' AND ${communityReports.createdAt} > ${dayAgo}`
    );

  return NextResponse.json({
    reports,
    confirmations24h: confirmCount[0]?.count ?? 0,
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json();
  const { stationId, reportType, fuelType, reportedPrice, comment } = body;

  if (!stationId || !reportType) {
    return NextResponse.json(
      { error: "stationId et reportType requis" },
      { status: 400 }
    );
  }

  const validTypes = ["price_confirm", "price_wrong", "closed", "queue", "shortage"];
  if (!validTypes.includes(reportType)) {
    return NextResponse.json({ error: "reportType invalide" }, { status: 400 });
  }

  const db = getDb();
  await db.insert(communityReports).values({
    userId: user.id,
    stationId,
    reportType,
    fuelType: fuelType ?? null,
    reportedPrice: reportedPrice ?? null,
    comment: comment ?? null,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
