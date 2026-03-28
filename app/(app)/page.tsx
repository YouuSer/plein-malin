"use client";

import { useMemo, useState, useCallback } from "react";
import { StationMap } from "@/components/map/StationMap";
import { StationCard } from "@/components/station/StationCard";
import { StationListSkeleton } from "@/components/ui/Skeleton";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useStations } from "@/hooks/useStations";
import { useFuelFilter } from "@/contexts/FuelFilterContext";
import { FUEL_TYPES } from "@/lib/constants";
import type { StationWithPrices } from "@/lib/types";

export default function HomePage() {
  const { selectedFuel, searchPosition, searchLabel } = useFuelFilter();
  const { position: geoPosition, isDefault, loading: geoLoading } = useGeolocation();
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const position = searchPosition ?? geoPosition;
  const { stations, loading: stationsLoading } = useStations(position, selectedFuel, 15);

  const loading = stationsLoading || geoLoading;

  const sortedStations = useMemo(() => {
    return [...stations].sort((a, b) => {
      const pa = a.prices.find((p) => p.fuelType === selectedFuel)?.price ?? Number.POSITIVE_INFINITY;
      const pb = b.prices.find((p) => p.fuelType === selectedFuel)?.price ?? Number.POSITIVE_INFINITY;
      return pa - pb;
    });
  }, [stations, selectedFuel]);

  const allPricesForFuel = useMemo(
    () =>
      stations
        .map((s) => s.prices.find((p) => p.fuelType === selectedFuel)?.price)
        .filter((p): p is number => p != null),
    [stations, selectedFuel]
  );

  const cheapest = sortedStations[0];
  const cheapestPrice = cheapest?.prices.find((p) => p.fuelType === selectedFuel)?.price;

  const avgPrice = allPricesForFuel.length
    ? allPricesForFuel.reduce((sum, p) => sum + p, 0) / allPricesForFuel.length
    : null;

  const topLocations = useMemo(() => {
    const counts = new Map<string, number>();
    for (const station of stations) {
      const key = station.city || "Inconnue";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([city, count]) => ({ city, count }));
  }, [stations]);

  const maxLocationCount = topLocations[0]?.count ?? 1;

  const handleStationClick = useCallback((station: StationWithPrices) => {
    window.location.href = `/station/${station.id}`;
  }, []);

  return (
    <div className="h-full p-3 md:p-4 lg:p-5">
      <div className="h-full flex gap-4">
        <aside
          className={`${mobileView === "list" ? "flex" : "hidden"} md:flex flex-col shrink-0 w-full md:w-[360px] lg:w-[390px] rounded-2xl border overflow-hidden`}
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="panel-header">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-tertiary)" }}>
                Live View
              </div>
              <h1 className="text-lg font-semibold leading-tight mt-0.5">
                Stations {FUEL_TYPES[selectedFuel].label}
              </h1>
              {searchLabel && (
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  Zone: {searchLabel}
                </p>
              )}
            </div>
            <span className="metric-pill">{stations.length} stations</span>
          </div>

          <div className="p-3 space-y-3 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="grid grid-cols-2 gap-3">
              <div className="dashboard-card !p-3">
                <div className="panel-label">Prix moyen</div>
                <div className="panel-value mt-1">
                  {avgPrice ? `${avgPrice.toFixed(3)} EUR/L` : "-"}
                </div>
              </div>
              <div className="dashboard-card !p-3">
                <div className="panel-label">Meilleur prix</div>
                <div className="panel-value mt-1" style={{ color: "var(--price-low)" }}>
                  {cheapestPrice ? `${cheapestPrice.toFixed(3)} EUR/L` : "-"}
                </div>
              </div>
            </div>

            <div className="dashboard-card !p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Top zones</div>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Sur la recherche courante
                </span>
              </div>
              <div className="space-y-2.5">
                {topLocations.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    Pas de donnees disponibles.
                  </p>
                ) : (
                  topLocations.map((loc) => (
                    <div key={loc.city}>
                      <div className="flex items-center justify-between text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                        <span className="font-medium truncate">{loc.city}</span>
                        <span>{loc.count}</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: "var(--surface-secondary)" }}>
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(loc.count / maxLocationCount) * 100}%`,
                            background: "var(--brand-gradient)",
                            backgroundImage: "var(--brand-gradient)",
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2.5">
            {cheapestPrice && !loading && (
              <div
                className="dashboard-card !p-3 flex items-center gap-2.5"
                style={{
                  background: "var(--price-low-soft)",
                  borderColor: "rgba(10, 138, 102, 0.22)",
                }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0" style={{ color: "var(--price-low)" }}>
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.46L7.82 10.12a.75.75 0 00-1.14.976l2.25 2.625a.75.75 0 001.177-.047l3.75-5.483z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-semibold" style={{ color: "var(--price-low)" }}>
                  {cheapest?.name ?? cheapest?.city} a {cheapestPrice.toFixed(3)} EUR/L
                </span>
              </div>
            )}

            {loading ? (
              <StationListSkeleton count={7} />
            ) : sortedStations.length === 0 ? (
              <div className="dashboard-card text-center py-10 text-sm" style={{ color: "var(--text-tertiary)" }}>
                Aucune station trouvee dans cette zone.
              </div>
            ) : (
              sortedStations.map((station, index) => (
                <StationCard
                  key={station.id}
                  station={station}
                  selectedFuel={selectedFuel}
                  allPricesForFuel={allPricesForFuel}
                  rank={index + 1}
                />
              ))
            )}
          </div>
        </aside>

        <section
          className={`${mobileView === "map" ? "flex" : "hidden"} md:flex flex-1 rounded-2xl border overflow-hidden relative`}
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="absolute top-3 left-3 z-10 hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border"
            style={{
              background: "rgba(255,255,255,0.86)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--brand)" }} />
            Vue temps reel
          </div>

          <StationMap
            stations={stations}
            selectedFuel={selectedFuel}
            userPosition={position}
            isDefaultPosition={isDefault && !searchPosition}
            onStationClick={handleStationClick}
          />
        </section>
      </div>

      <div
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex rounded-full overflow-hidden border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <button
          onClick={() => setMobileView("list")}
          className="px-4 py-2 text-sm font-semibold transition-colors"
          style={{
            background: mobileView === "list" ? "var(--brand-gradient)" : "transparent",
            backgroundImage: mobileView === "list" ? "var(--brand-gradient)" : undefined,
            color: mobileView === "list" ? "white" : "var(--text-secondary)",
          }}
        >
          Liste
        </button>
        <button
          onClick={() => setMobileView("map")}
          className="px-4 py-2 text-sm font-semibold transition-colors"
          style={{
            background: mobileView === "map" ? "var(--brand-gradient)" : "transparent",
            backgroundImage: mobileView === "map" ? "var(--brand-gradient)" : undefined,
            color: mobileView === "map" ? "white" : "var(--text-secondary)",
          }}
        >
          Carte
        </button>
      </div>
    </div>
  );
}
