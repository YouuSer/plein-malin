import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { stations } from "@/lib/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${baseUrl}/classement`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/tendances`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  ];

  // Add top stations (limit for sitemap size)
  try {
    const db = getDb();
    const allStations = await db
      .select({ id: stations.id, lastUpdated: stations.lastUpdated })
      .from(stations)
      .limit(5000);

    const stationPages: MetadataRoute.Sitemap = allStations.map((s) => ({
      url: `${baseUrl}/station/${s.id}`,
      lastModified: new Date(s.lastUpdated),
      changeFrequency: "hourly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...stationPages];
  } catch {
    return staticPages;
  }
}
