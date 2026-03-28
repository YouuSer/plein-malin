"use client";

import { FUEL_TYPES, type FuelType, FUEL_TYPE_KEYS } from "@/lib/constants";

interface FilterChipsProps {
  selected: FuelType;
  onChange: (fuel: FuelType) => void;
}

export function FilterChips({ selected, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-1 py-1">
      {FUEL_TYPE_KEYS.map((key) => {
        const fuel = FUEL_TYPES[key];
        const isActive = selected === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={{
              background: isActive ? "var(--accent)" : "var(--surface)",
              color: isActive ? "#fff" : "var(--text-secondary)",
              boxShadow: isActive ? "none" : "var(--shadow-sm)",
              border: isActive ? "none" : "1px solid var(--border)",
            }}
          >
            {fuel.label}
          </button>
        );
      })}
    </div>
  );
}
