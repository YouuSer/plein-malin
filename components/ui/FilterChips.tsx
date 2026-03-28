"use client";

import { FUEL_TYPES, type FuelType, FUEL_TYPE_KEYS } from "@/lib/constants";

interface FilterChipsProps {
  selected: FuelType;
  onChange: (fuel: FuelType) => void;
  tone?: "default" | "topbar";
}

export function FilterChips({ selected, onChange, tone = "default" }: FilterChipsProps) {
  const isTopbar = tone === "topbar";

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
      {FUEL_TYPE_KEYS.map((key) => {
        const fuel = FUEL_TYPES[key];
        const isActive = selected === key;

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background: isActive
                ? "var(--brand-gradient)"
                : isTopbar
                  ? "rgba(255, 255, 255, 0.06)"
                  : "transparent",
              backgroundImage: isActive ? "var(--brand-gradient)" : undefined,
              color: isActive ? "#fff" : isTopbar ? "#c1ccda" : "var(--text-secondary)",
              borderRadius: "var(--radius-full)",
              border: isActive
                ? "1px solid transparent"
                : `1px solid ${isTopbar ? "rgba(255, 255, 255, 0.14)" : "var(--border)"}`,
            }}
          >
            {fuel.label}
          </button>
        );
      })}
    </div>
  );
}
