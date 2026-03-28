"use client";

import { useEffect, useMemo, useState } from "react";
import { StationCard } from "@/components/station/StationCard";
import { StationListSkeleton } from "@/components/ui/Skeleton";
import { useFuelFilter } from "@/contexts/FuelFilterContext";
import { FUEL_TYPES, FRANCE_CENTER } from "@/lib/constants";
import type { StationWithPrices } from "@/lib/types";

export default function ClassementPage() {
  const { selectedFuel } = useFuelFilter();
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

  const sorted = useMemo(() => {
    return [...stations].sort((a, b) => {
      const pa = a.prices.find((p) => p.fuelType === selectedFuel)?.price ?? Number.POSITIVE_INFINITY;
      const pb = b.prices.find((p) => p.fuelType === selectedFuel)?.price ?? Number.POSITIVE_INFINITY;
      return pa - pb;
    });
  }, [stations, selectedFuel]);

  const allPrices = useMemo(
    () => sorted.map((s) => s.prices.find((p) => p.fuelType === selectedFuel)?.price).filter((p): p is number => p != null),
    [sorted, selectedFuel]
  );

  const topThree = sorted.slice(0, 3);

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-5">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="dashboard-card !p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-tertiary)" }}>
                Classement national
              </div>
              <h1 className="text-xl font-semibold mt-0.5">Top stations {FUEL_TYPES[selectedFuel].label}</h1>
            </div>
            <span className="metric-pill">{stations.length} stations analysees</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((index) => {
            const station = topThree[index];
            const price = station?.prices.find((p) => p.fuelType === selectedFuel)?.price;
            return (
              <div key={index} className="dashboard-card !p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--text-tertiary)" }}>
                  #{index + 1}
                </div>
                <div className="mt-1 font-semibold text-sm truncate">{station?.name ?? station?.city ?? "-"}</div>
                <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>
                  {station?.city ?? "Aucune donnee"}
                </div>
                <div className="text-base font-bold mt-2" style={{ color: "var(--price-low)" }}>
                  {price ? `${price.toFixed(3)} EUR/L` : "-"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="dashboard-card !p-0 overflow-hidden">
          <div className="panel-header">
            <h2 className="text-sm font-semibold">Classement complet</h2>
            <span className="metric-pill">Top 50</span>
          </div>

          <div className="p-3 space-y-2">
            {loading ? (
              <StationListSkeleton count={8} />
            ) : sorted.length === 0 ? (
              <div className="text-center py-10 text-sm" style={{ color: "var(--text-tertiary)" }}>
                Aucune station trouvee
              </div>
            ) : (
              sorted.slice(0, 50).map((station, index) => (
                <StationCard
                  key={station.id}
                  station={station}
                  selectedFuel={selectedFuel}
                  allPricesForFuel={allPrices}
                  rank={index + 1}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
