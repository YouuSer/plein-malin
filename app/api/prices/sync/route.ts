import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { stations, currentPrices, priceHistory } from "@/lib/schema";
import { fetchAllStations } from "@/lib/fuel-api";
import { eq, and } from "drizzle-orm";

const SYNC_SECRET = process.env.SYNC_SECRET || "dev-secret";

export async function GET(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${SYNC_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const allStations = await fetchAllStations();

    let stationsUpserted = 0;
    let pricesUpserted = 0;

    for (const s of allStations) {
      // Upsert station
      await db
        .insert(stations)
        .values({
          id: s.id,
          name: s.name,
          address: s.address,
          city: s.city,
          postalCode: s.postalCode,
          department: s.department,
          latitude: s.latitude,
          longitude: s.longitude,
          services: JSON.stringify(s.services),
          isAutomate24h: s.isAutomate24h,
          lastUpdated: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: stations.id,
          set: {
            name: s.name,
            address: s.address,
            city: s.city,
            postalCode: s.postalCode,
            department: s.department,
            latitude: s.latitude,
            longitude: s.longitude,
            services: JSON.stringify(s.services),
            isAutomate24h: s.isAutomate24h,
            lastUpdated: new Date().toISOString(),
          },
        });
      stationsUpserted++;

      // Upsert prices
      for (const p of s.prices) {
        // Delete existing price for this station+fuel combo
        await db
          .delete(currentPrices)
          .where(
            and(
              eq(currentPrices.stationId, s.id),
              eq(currentPrices.fuelType, p.fuelType)
            )
          );

        // Insert new price
        await db.insert(currentPrices).values({
          stationId: s.id,
          fuelType: p.fuelType,
          price: p.price,
          updatedAt: p.updatedAt,
          shortage: p.shortage,
        });
        pricesUpserted++;
      }
    }

    // Store price history snapshot (only runs if called with ?snapshot=true)
    const url = new URL(request.url);
    if (url.searchParams.get("snapshot") === "true") {
      for (const s of allStations) {
        for (const p of s.prices) {
          await db.insert(priceHistory).values({
            stationId: s.id,
            fuelType: p.fuelType,
            price: p.price,
            recordedAt: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      stations: stationsUpserted,
      prices: pricesUpserted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}
