import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { stations, currentPrices, priceHistory } from "@/lib/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const db = getDb();

    const station = await db
      .select()
      .from(stations)
      .where(eq(stations.id, id))
      .limit(1);

    if (station.length === 0) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const prices = await db
      .select()
      .from(currentPrices)
      .where(eq(currentPrices.stationId, id));

    // Price history for the last 30 days
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const history = await db
      .select()
      .from(priceHistory)
      .where(
        and(
          eq(priceHistory.stationId, id),
          gte(priceHistory.recordedAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(priceHistory.recordedAt));

    const s = station[0];

    return NextResponse.json({
      ...s,
      services: s.services ? JSON.parse(s.services) : [],
      prices: prices.map((p) => ({
        fuelType: p.fuelType,
        price: p.price,
        updatedAt: p.updatedAt,
        shortage: p.shortage,
      })),
      priceHistory: history.map((h) => ({
        fuelType: h.fuelType,
        price: h.price,
        recordedAt: h.recordedAt,
      })),
    });
  } catch (error) {
    console.error("Station detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch station" },
      { status: 500 }
    );
  }
}
