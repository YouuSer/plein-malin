"use client";

import { useEffect, useState } from "react";
import { FilterChips } from "@/components/ui/FilterChips";
import { StationCard } from "@/components/station/StationCard";
import { DEFAULT_FUEL, type FuelType } from "@/lib/constants";
import { FRANCE_CENTER } from "@/lib/constants";
import type { StationWithPrices } from "@/lib/types";

export default function ClassementPage() {
  const [selectedFuel, setSelectedFuel] = useState<FuelType>(DEFAULT_FUEL);
  const [stations, setStations] = useState<StationWithPrices[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      lat: FRANCE_CENTER.lat.toString(),
      lng: FRANCE_CENTER.lng.toString(),
      radius: "50",
      fuel: selectedFuel,
    });

    fetch(`/api/stations?${params}`)
      .then((r) => r.json())
      .then((data) => setStations(data.stations ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedFuel]);

  const sorted = [...stations].sort((a, b) => {
    const pa =
      a.prices.find((p) => p.fuelType === selectedFuel)?.price ?? Infinity;
    const pb =
      b.prices.find((p) => p.fuelType === selectedFuel)?.price ?? Infinity;
    return pa - pb;
  });

  const allPrices = sorted
    .map((s) => s.prices.find((p) => p.fuelType === selectedFuel)?.price)
    .filter((p): p is number => p != null);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Classement</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Les stations les moins cheres
          </p>
        </div>

        <FilterChips selected={selectedFuel} onChange={setSelectedFuel} />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: "var(--surface-secondary)" }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.slice(0, 50).map((station, index) => (
              <div key={station.id} className="flex items-center gap-2">
                <span
                  className="w-7 text-center text-xs font-bold shrink-0"
                  style={{
                    color:
                      index < 3 ? "var(--price-low)" : "var(--text-tertiary)",
                  }}
                >
                  #{index + 1}
                </span>
                <div className="flex-1">
                  <StationCard
                    station={station}
                    selectedFuel={selectedFuel}
                    allPricesForFuel={allPrices}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
