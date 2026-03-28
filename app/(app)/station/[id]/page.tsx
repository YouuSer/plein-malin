"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FUEL_TYPES, type FuelType, FUEL_TYPE_KEYS } from "@/lib/constants";
import { PriceTag, getPriceVariant } from "@/components/ui/PriceTag";
import { SavingsCalculator } from "@/components/station/SavingsCalculator";
import { PriceTrendChart } from "@/components/station/PriceTrendChart";

interface StationDetail {
  id: string;
  name: string | null;
  address: string;
  city: string;
  postalCode: string;
  department: string | null;
  latitude: number;
  longitude: number;
  services: string[];
  isAutomate24h: boolean;
  prices: { fuelType: FuelType; price: number; updatedAt: string; shortage: string | null }[];
  priceHistory: { fuelType: string; price: number; recordedAt: string }[];
}

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [station, setStation] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFuel, setSelectedFuel] = useState<FuelType>("e10");

  useEffect(() => {
    fetch(`/api/stations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setStation(data);
        // Default to the cheapest available fuel
        if (data.prices?.length > 0) {
          setSelectedFuel(data.prices[0].fuelType);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: "var(--surface-secondary)" }} />
        <div className="h-4 w-64 rounded animate-pulse" style={{ background: "var(--surface-secondary)" }} />
        <div className="h-32 rounded-xl animate-pulse" style={{ background: "var(--surface-secondary)" }} />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="p-4 text-center" style={{ color: "var(--text-tertiary)" }}>
        Station introuvable
      </div>
    );
  }

  const allPrices = station.prices.map((p) => p.price);
  const mainPrice = station.prices.find((p) => p.fuelType === selectedFuel);

  // Time since last update
  const lastUpdate = mainPrice
    ? formatTimeSince(new Date(mainPrice.updatedAt))
    : null;

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: "var(--surface-secondary)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base truncate">{station.name ?? "Station"}</h1>
          <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
            {station.address}, {station.postalCode} {station.city}
          </p>
        </div>
        {station.isAutomate24h && (
          <span className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: "var(--price-low-soft)", color: "var(--price-low)" }}>
            24h/24
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Price grid */}
        <section>
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
            Prix des carburants
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {FUEL_TYPE_KEYS.map((fuelKey) => {
              const price = station.prices.find((p) => p.fuelType === fuelKey);
              if (!price) return null;
              const fuel = FUEL_TYPES[fuelKey];
              const isSelected = selectedFuel === fuelKey;
              return (
                <button
                  key={fuelKey}
                  onClick={() => setSelectedFuel(fuelKey)}
                  className="flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{
                    background: isSelected ? "var(--accent-soft)" : "var(--surface-secondary)",
                    border: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                  }}
                >
                  <span className="text-sm font-medium">{fuel.label}</span>
                  <PriceTag
                    price={price.price}
                    size="sm"
                    variant={getPriceVariant(price.price, allPrices)}
                  />
                </button>
              );
            })}
          </div>
          {lastUpdate && (
            <p className="text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>
              Mis a jour {lastUpdate}
            </p>
          )}
        </section>

        {/* Savings calculator */}
        {mainPrice && (
          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Economies estimees
            </h2>
            <SavingsCalculator
              stationPrice={mainPrice.price}
              areaPrices={allPrices}
            />
          </section>
        )}

        {/* Price trends */}
        {station.priceHistory.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Evolution du prix
            </h2>
            <div className="rounded-xl p-3" style={{ background: "var(--surface-secondary)" }}>
              <PriceTrendChart data={station.priceHistory} fuelType={selectedFuel} />
            </div>
          </section>
        )}

        {/* Services */}
        {station.services.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Services
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {station.services.map((service) => (
                <span
                  key={service}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)" }}
                >
                  {service}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Map link */}
        <section className="pb-4">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-colors"
            style={{ background: "var(--accent)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Itineraire
          </a>
        </section>
      </div>
    </div>
  );
}

function formatTimeSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "a l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  return `il y a ${diffDays}j`;
}
