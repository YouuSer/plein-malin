import { getDb } from "@/lib/db";
import { shareTokens, stations, currentPrices } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { FUEL_TYPES } from "@/lib/constants";
import type { FuelType } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

interface ShareData {
  stationId: string;
  stationName: string;
  fuelType: FuelType;
  price: number;
}

async function getShareData(token: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(shareTokens)
    .where(eq(shareTokens.id, token))
    .limit(1);

  if (rows.length === 0) return null;

  // Increment view count
  await db
    .update(shareTokens)
    .set({ views: (rows[0].views ?? 0) + 1 })
    .where(eq(shareTokens.id, token));

  return {
    ...rows[0],
    data: JSON.parse(rows[0].data) as ShareData,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const share = await getShareData(token);

  if (!share) {
    return { title: "Plein Malin" };
  }

  const d = share.data;
  const fuel = FUEL_TYPES[d.fuelType]?.label ?? d.fuelType;
  const title = `${fuel} a ${d.price.toFixed(3)} EUR/L - ${d.stationName}`;
  const description = `Trouvez les meilleurs prix d'essence pres de chez vous avec Plein Malin`;

  const ogUrl = new URL("/api/og", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  ogUrl.searchParams.set("type", "prix");
  ogUrl.searchParams.set("station", d.stationName);
  ogUrl.searchParams.set("price", d.price.toFixed(3));
  ogUrl.searchParams.set("fuel", fuel);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl.toString()],
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await getShareData(token);

  if (!share) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-xl font-bold mb-2">Lien expire</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Ce lien de partage n'existe plus.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Decouvrir Plein Malin
          </Link>
        </div>
      </div>
    );
  }

  const d = share.data;
  const fuel = FUEL_TYPES[d.fuelType]?.label ?? d.fuelType;

  // Get current price for this station
  const db = getDb();
  const currentPrice = await db
    .select()
    .from(currentPrices)
    .where(eq(currentPrices.stationId, d.stationId))
    .limit(6);

  const station = await db
    .select()
    .from(stations)
    .where(eq(stations.id, d.stationId))
    .limit(1);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-1">Plein Malin</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Le plein au meilleur prix
          </p>
        </div>

        {/* Price card */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, #1d4ed8 100%)",
            color: "white",
          }}
        >
          <div className="text-sm opacity-80 mb-1">
            {fuel} chez {d.stationName}
          </div>
          <div className="text-5xl font-extrabold tabular-nums my-3">
            {d.price.toFixed(3)}
            <span className="text-xl ml-1">EUR/L</span>
          </div>
          {station[0] && (
            <div className="text-sm opacity-70">
              {station[0].city} ({station[0].postalCode})
            </div>
          )}
        </div>

        {/* Current prices at this station */}
        {currentPrice.length > 0 && (
          <div>
            <h2
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Prix actuels
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {currentPrice.map((p) => (
                <div
                  key={p.fuelType}
                  className="flex justify-between items-center px-3 py-2 rounded-xl"
                  style={{
                    background: "var(--surface-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span className="text-sm font-medium">
                    {FUEL_TYPES[p.fuelType as FuelType]?.label ?? p.fuelType}
                  </span>
                  <span className="text-sm font-bold tabular-nums">
                    {p.price.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="space-y-2">
          <Link
            href={`/station/${d.stationId}`}
            className="block w-full py-3 rounded-xl font-semibold text-sm text-white text-center"
            style={{ background: "var(--accent)" }}
          >
            Voir cette station
          </Link>
          <Link
            href="/"
            className="block w-full py-3 rounded-xl font-semibold text-sm text-center"
            style={{
              background: "var(--surface-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            Trouver les meilleurs prix pres de moi
          </Link>
        </div>

        <p
          className="text-center text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          {share.views} vue{(share.views ?? 0) > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
