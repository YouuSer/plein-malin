import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { stations } from "@/lib/schema";
import { like, sql } from "drizzle-orm";

/** Returns unique city suggestions for autocomplete */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const db = getDb();

    const results = await db
      .selectDistinct({
        city: stations.city,
        postalCode: stations.postalCode,
        department: stations.department,
        latitude: sql<number>`AVG(${stations.latitude})`.as("latitude"),
        longitude: sql<number>`AVG(${stations.longitude})`.as("longitude"),
      })
      .from(stations)
      .where(like(stations.city, `${q.toUpperCase()}%`))
      .groupBy(stations.city, stations.postalCode, stations.department)
      .limit(10);

    return NextResponse.json({
      cities: results.map((r) => ({
        city: r.city,
        postalCode: r.postalCode,
        department: r.department,
        lat: r.latitude,
        lng: r.longitude,
      })),
    });
  } catch (error) {
    console.error("Cities autocomplete error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
