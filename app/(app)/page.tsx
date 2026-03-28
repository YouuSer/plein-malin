"use client";

import { useState, useCallback } from "react";
import { StationMap } from "@/components/map/StationMap";
import { StationCard } from "@/components/station/StationCard";
import { FilterChips } from "@/components/ui/FilterChips";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useStations } from "@/hooks/useStations";
import { DEFAULT_FUEL, FUEL_TYPES, type FuelType } from "@/lib/constants";
import type { StationWithPrices } from "@/lib/types";

export default function HomePage() {
  const [selectedFuel, setSelectedFuel] = useState<FuelType>(DEFAULT_FUEL);
  const { position, isDefault, loading: geoLoading } = useGeolocation();
  const { stations, loading: stationsLoading } = useStations(
    position,
    selectedFuel,
    15
  );

  const allPricesForFuel = stations
    .map((s) => s.prices.find((p) => p.fuelType === selectedFuel)?.price)
    .filter((p): p is number => p != null);

  const handleStationClick = useCallback((station: StationWithPrices) => {
    window.location.href = `/station/${station.id}`;
  }, []);

  // Sort: cheapest first for the selected fuel
  const sortedStations = [...stations].sort((a, b) => {
    const pa = a.prices.find((p) => p.fuelType === selectedFuel)?.price ?? Infinity;
    const pb = b.prices.find((p) => p.fuelType === selectedFuel)?.price ?? Infinity;
    return pa - pb;
  });

  const cheapest = sortedStations[0];
  const cheapestPrice = cheapest?.prices.find(
    (p) => p.fuelType === selectedFuel
  )?.price;

  return (
    <div className="relative h-full">
      {/* Filter chips - floating above map */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <FilterChips selected={selectedFuel} onChange={setSelectedFuel} />
      </div>

      {/* Cheapest station banner */}
      {cheapestPrice && !stationsLoading && (
        <div
          className="absolute top-14 left-3 right-3 z-10 flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{
            background: "var(--price-low-soft)",
            border: "1px solid var(--price-low)",
            color: "var(--price-low)",
            backdropFilter: "blur(8px)",
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.46L7.82 10.12a.75.75 0 00-1.14.976l2.25 2.625a.75.75 0 001.177-.047l3.75-5.483z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold">
            Moins cher : {cheapest.name ?? cheapest.city} a{" "}
            {cheapestPrice.toFixed(3)} EUR/L
          </span>
        </div>
      )}

      {/* Map */}
      <StationMap
        stations={stations}
        selectedFuel={selectedFuel}
        userPosition={position}
        isDefaultPosition={isDefault}
        onStationClick={handleStationClick}
      />

      {/* Bottom sheet with station list */}
      <BottomSheet>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">
            Stations {FUEL_TYPES[selectedFuel].label}
          </h2>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: "var(--surface-secondary)",
              color: "var(--text-secondary)",
            }}
          >
            {stations.length} resultats
          </span>
        </div>

        {stationsLoading || geoLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: "var(--surface-secondary)" }}
              />
            ))}
          </div>
        ) : stations.length === 0 ? (
          <div
            className="text-center py-8 text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            Aucune station trouvee dans cette zone
          </div>
        ) : (
          <div className="space-y-2">
            {sortedStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                selectedFuel={selectedFuel}
                allPricesForFuel={allPricesForFuel}
              />
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
