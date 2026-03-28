"use client";

import { useFuelFilter } from "@/contexts/FuelFilterContext";
import { FUEL_TYPES } from "@/lib/constants";

export default function TendancesPage() {
  const { selectedFuel } = useFuelFilter();

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-5">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="dashboard-card !p-4">
          <div className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: "var(--text-tertiary)" }}>
            Tendances
          </div>
          <h1 className="text-xl font-semibold mt-0.5">Evolution des prix {FUEL_TYPES[selectedFuel].label}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Les graphiques consolides seront visibles apres collecte continue des donnees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {[
            { label: "Volatilite", value: "Bientot" },
            { label: "Variation 7 jours", value: "Bientot" },
            { label: "Projection", value: "Bientot" },
          ].map((item) => (
            <div key={item.label} className="dashboard-card !p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--text-tertiary)" }}>
                {item.label}
              </div>
              <div className="text-lg font-semibold mt-1">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-card !p-0 overflow-hidden">
          <div className="panel-header">
            <h2 className="text-sm font-semibold">Module en preparation</h2>
            <span className="metric-pill">Roadmap</span>
          </div>
          <div className="p-8 text-center">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{
                background: "var(--brand-gradient-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                className="w-8 h-8"
                style={{ color: "var(--brand)" }}
              >
                <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-semibold text-sm mb-1">Bientot disponible</p>
            <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--text-tertiary)" }}>
              Nous finalisons les analyses historiques (jour/semaine/mois) et la comparaison entre carburants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
