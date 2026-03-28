import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { stations, currentPrices } from "@/lib/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { boundingBox, haversineDistance } from "@/lib/geo";
import type { FuelType } from "@/lib/constants";

// In-memory cache
let cache: { data: unknown; timestamp: number; key: string } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get("lat") || "");
  const lng = parseFloat(url.searchParams.get("lng") || "");
  const radiusKm = parseFloat(url.searchParams.get("radius") || "10");
  const fuel = (url.searchParams.get("fuel") || "") as FuelType;

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 }
    );
  }

  // Check cache
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)},${radiusKm},${fuel}`;
  if (cache && cache.key === cacheKey && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const db = getDb();
    const bbox = boundingBox({ lat, lng }, radiusKm);

    // Get stations in bounding box
    const stationRows = await db
      .select()
      .from(stations)
      .where(
        and(
          gte(stations.latitude, bbox.minLat),
          lte(stations.latitude, bbox.maxLat),
          gte(stations.longitude, bbox.minLng),
          lte(stations.longitude, bbox.maxLng)
        )
      );

    // Get prices for these stations, optionally filtered by fuel type
    const stationIds = stationRows.map((s) => s.id);

    if (stationIds.length === 0) {
      return NextResponse.json({ stations: [], count: 0 });
    }

    const priceConditions = fuel
      ? and(
          sql`${currentPrices.stationId} IN (${sql.join(
            stationIds.map((id) => sql`${id}`),
            sql`, `
          )})`,
          eq(currentPrices.fuelType, fuel)
        )
      : sql`${currentPrices.stationId} IN (${sql.join(
          stationIds.map((id) => sql`${id}`),
          sql`, `
        )})`;

    const priceRows = await db
      .select()
      .from(currentPrices)
      .where(priceConditions);

    // Build price map
    const priceMap = new Map<string, typeof priceRows>();
    for (const p of priceRows) {
      const existing = priceMap.get(p.stationId) ?? [];
      existing.push(p);
      priceMap.set(p.stationId, existing);
    }

    // Combine and filter by actual haversine distance
    const results = stationRows
      .map((s) => {
        const prices = priceMap.get(s.id) ?? [];
        if (prices.length === 0) return null;

        const distance = haversineDistance({ lat, lng }, { lat: s.latitude, lng: s.longitude });
        if (distance > radiusKm) return null;

        return {
          ...s,
          services: s.services ? JSON.parse(s.services) : [],
          prices: prices.map((p) => ({
            fuelType: p.fuelType,
            price: p.price,
            updatedAt: p.updatedAt,
            shortage: p.shortage,
          })),
          distance: Math.round(distance * 10) / 10,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a!.distance ?? 0) - (b!.distance ?? 0));

    const response = { stations: results, count: results.length };

    // Cache
    cache = { data: response, timestamp: Date.now(), key: cacheKey };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Stations API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}
