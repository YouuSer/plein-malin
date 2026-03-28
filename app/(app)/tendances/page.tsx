"use client";

import { useState } from "react";
import { FilterChips } from "@/components/ui/FilterChips";
import { DEFAULT_FUEL, type FuelType, FUEL_TYPES } from "@/lib/constants";

export default function TendancesPage() {
  const [selectedFuel, setSelectedFuel] = useState<FuelType>(DEFAULT_FUEL);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Tendances</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Evolution des prix {FUEL_TYPES[selectedFuel].label}
          </p>
        </div>

        <FilterChips selected={selectedFuel} onChange={setSelectedFuel} />

        <div
          className="rounded-xl p-8 text-center"
          style={{ background: "var(--surface-secondary)" }}
        >
          <div className="text-3xl mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 mx-auto" style={{ color: "var(--text-tertiary)" }}>
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-semibold mb-1">Bientot disponible</p>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Les graphiques de tendances seront disponibles apres quelques jours
            de collecte de donnees.
          </p>
        </div>
      </div>
    </div>
  );
}
