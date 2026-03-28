import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { favorites, stations, currentPrices } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth-utils";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const db = getDb();

  const userFavorites = await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, user.id));

  if (userFavorites.length === 0) {
    return NextResponse.json({ favorites: [] });
  }

  // Fetch station details + prices
  const stationIds = userFavorites.map((f) => f.stationId);
  const stationRows = await db
    .select()
    .from(stations)
    .where(
      sql`${stations.id} IN (${sql.join(
        stationIds.map((id) => sql`${id}`),
        sql`, `
      )})`
    );

  const priceRows = await db
    .select()
    .from(currentPrices)
    .where(
      sql`${currentPrices.stationId} IN (${sql.join(
        stationIds.map((id) => sql`${id}`),
        sql`, `
      )})`
    );

  const priceMap = new Map<string, typeof priceRows>();
  for (const p of priceRows) {
    const existing = priceMap.get(p.stationId) ?? [];
    existing.push(p);
    priceMap.set(p.stationId, existing);
  }

  const results = stationRows.map((s) => ({
    ...s,
    services: s.services ? JSON.parse(s.services) : [],
    prices: (priceMap.get(s.id) ?? []).map((p) => ({
      fuelType: p.fuelType,
      price: p.price,
      updatedAt: p.updatedAt,
      shortage: p.shortage,
    })),
    favoritedAt: userFavorites.find((f) => f.stationId === s.id)?.createdAt,
  }));

  return NextResponse.json({ favorites: results });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { stationId } = await request.json();
  if (!stationId) {
    return NextResponse.json(
      { error: "stationId requis" },
      { status: 400 }
    );
  }

  const db = getDb();

  // Check if already favorited
  const existing = await db
    .select()
    .from(favorites)
    .where(
      and(eq(favorites.userId, user.id), eq(favorites.stationId, stationId))
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove favorite (toggle)
    await db
      .delete(favorites)
      .where(
        and(eq(favorites.userId, user.id), eq(favorites.stationId, stationId))
      );
    return NextResponse.json({ favorited: false });
  }

  // Add favorite
  await db.insert(favorites).values({
    userId: user.id,
    stationId,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ favorited: true });
}
