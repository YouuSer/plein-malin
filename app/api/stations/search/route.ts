import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { stations, currentPrices } from "@/lib/schema";
import { or, like, eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const fuel = url.searchParams.get("fuel") || "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

  if (!q || q.length < 2) {
    return NextResponse.json({ stations: [] });
  }

  try {
    const db = getDb();

    // Search by city name or postal code
    const searchPattern = `%${q}%`;
    const stationRows = await db
      .select()
      .from(stations)
      .where(
        or(
          like(stations.city, searchPattern),
          like(stations.postalCode, searchPattern),
          like(stations.name, searchPattern)
        )
      )
      .limit(limit);

    if (stationRows.length === 0) {
      return NextResponse.json({ stations: [], count: 0 });
    }

    // Get prices
    const stationIds = stationRows.map((s) => s.id);
    const priceConditions = fuel
      ? sql`${currentPrices.stationId} IN (${sql.join(
          stationIds.map((id) => sql`${id}`),
          sql`, `
        )}) AND ${currentPrices.fuelType} = ${fuel}`
      : sql`${currentPrices.stationId} IN (${sql.join(
          stationIds.map((id) => sql`${id}`),
          sql`, `
        )})`;

    const priceRows = await db
      .select()
      .from(currentPrices)
      .where(priceConditions);

    const priceMap = new Map<string, typeof priceRows>();
    for (const p of priceRows) {
      const existing = priceMap.get(p.stationId) ?? [];
      existing.push(p);
      priceMap.set(p.stationId, existing);
    }

    const results = stationRows
      .map((s) => {
        const prices = priceMap.get(s.id) ?? [];
        if (prices.length === 0) return null;
        return {
          ...s,
          services: s.services ? JSON.parse(s.services) : [],
          prices: prices.map((p) => ({
            fuelType: p.fuelType,
            price: p.price,
            updatedAt: p.updatedAt,
            shortage: p.shortage,
          })),
        };
      })
      .filter(Boolean);

    return NextResponse.json({ stations: results, count: results.length });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
