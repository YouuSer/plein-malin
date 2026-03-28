import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { priceAlerts, stations } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth-utils";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const db = getDb();
  const alerts = await db
    .select()
    .from(priceAlerts)
    .where(eq(priceAlerts.userId, user.id));

  // Enrich with station names
  const stationIds = alerts
    .map((a) => a.stationId)
    .filter((id): id is string => id !== null);

  let stationMap = new Map<string, string>();
  if (stationIds.length > 0) {
    const stationRows = await db
      .select({ id: stations.id, name: stations.name, city: stations.city })
      .from(stations)
      .where(
        sql`${stations.id} IN (${sql.join(
          stationIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      );
    stationMap = new Map(
      stationRows.map((s) => [s.id, s.name ?? s.city])
    );
  }

  const enriched = alerts.map((a) => ({
    ...a,
    stationName: a.stationId ? stationMap.get(a.stationId) ?? null : null,
  }));

  return NextResponse.json({ alerts: enriched });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json();
  const { stationId, fuelType, targetPrice, radiusKm } = body;

  if (!fuelType || !targetPrice) {
    return NextResponse.json(
      { error: "fuelType et targetPrice requis" },
      { status: 400 }
    );
  }

  const db = getDb();
  await db.insert(priceAlerts).values({
    userId: user.id,
    stationId: stationId ?? null,
    fuelType,
    targetPrice,
    radiusKm: radiusKm ?? null,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const alertId = searchParams.get("id");

  if (!alertId) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const db = getDb();
  await db
    .delete(priceAlerts)
    .where(eq(priceAlerts.id, parseInt(alertId)));

  return NextResponse.json({ success: true });
}
