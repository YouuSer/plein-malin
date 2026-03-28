import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fillUps, currentPrices, stations } from "@/lib/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth-utils";
import { boundingBox } from "@/lib/geo";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const db = getDb();
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const logs = await db
    .select()
    .from(fillUps)
    .where(eq(fillUps.userId, user.id))
    .orderBy(sql`${fillUps.filledAt} DESC`)
    .limit(limit);

  // Compute totals
  const allLogs = await db
    .select({
      totalCost: sql<number>`SUM(${fillUps.totalCost})`,
      totalSaved: sql<number>`SUM(${fillUps.savedVsAverage})`,
      totalLiters: sql<number>`SUM(${fillUps.liters})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(fillUps)
    .where(eq(fillUps.userId, user.id));

  const stats = allLogs[0] ?? {
    totalCost: 0,
    totalSaved: 0,
    totalLiters: 0,
    count: 0,
  };

  return NextResponse.json({ fillUps: logs, stats });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json();
  const { stationId, fuelType, liters, pricePerLiter } = body;

  if (!stationId || !fuelType || !liters || !pricePerLiter) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const db = getDb();
  const totalCost = liters * pricePerLiter;

  // Compute savings vs area average
  const station = await db
    .select()
    .from(stations)
    .where(eq(stations.id, stationId))
    .limit(1);

  let savedVsAverage = 0;
  if (station.length > 0) {
    const s = station[0];
    const bbox = boundingBox({ lat: s.latitude, lng: s.longitude }, 10);

    const nearbyStationIds = await db
      .select({ id: stations.id })
      .from(stations)
      .where(
        and(
          gte(stations.latitude, bbox.minLat),
          lte(stations.latitude, bbox.maxLat),
          gte(stations.longitude, bbox.minLng),
          lte(stations.longitude, bbox.maxLng)
        )
      );

    if (nearbyStationIds.length > 0) {
      const avgResult = await db
        .select({ avg: sql<number>`AVG(${currentPrices.price})` })
        .from(currentPrices)
        .where(
          and(
            sql`${currentPrices.stationId} IN (${sql.join(
              nearbyStationIds.map((s) => sql`${s.id}`),
              sql`, `
            )})`,
            eq(currentPrices.fuelType, fuelType)
          )
        );

      const avgPrice = avgResult[0]?.avg ?? pricePerLiter;
      savedVsAverage = (avgPrice - pricePerLiter) * liters;
    }
  }

  await db.insert(fillUps).values({
    userId: user.id,
    stationId,
    fuelType,
    liters,
    pricePerLiter,
    totalCost: Math.round(totalCost * 100) / 100,
    savedVsAverage: Math.round(savedVsAverage * 100) / 100,
    filledAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    totalCost: Math.round(totalCost * 100) / 100,
    savedVsAverage: Math.round(savedVsAverage * 100) / 100,
  });
}
