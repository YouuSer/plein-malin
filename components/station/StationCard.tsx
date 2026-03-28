"use client";

import Link from "next/link";
import type { StationWithPrices } from "@/lib/types";
import type { FuelType } from "@/lib/constants";
import { PriceTag, getPriceVariant } from "@/components/ui/PriceTag";
import { formatDistance } from "@/lib/geo";

interface StationCardProps {
  station: StationWithPrices;
  selectedFuel: FuelType;
  allPricesForFuel: number[];
  rank?: number;
}

export function StationCard({
  station,
  selectedFuel,
  allPricesForFuel,
  rank,
}: StationCardProps) {
  const mainPrice = station.prices.find((p) => p.fuelType === selectedFuel);
  const variant = mainPrice ? getPriceVariant(mainPrice.price, allPricesForFuel) : "neutral";
  const isCheapest = rank === 1;

  return (
    <Link
      href={`/station/${station.id}`}
      className="flex items-center gap-3 p-3 rounded-xl transition-colors"
      style={{
        background: "var(--surface)",
        border: `1px solid ${isCheapest ? "rgba(10, 138, 102, 0.26)" : "var(--border)"}`,
        boxShadow: isCheapest ? "var(--shadow-xs)" : "none",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
        style={{
          background: isCheapest ? "var(--brand-gradient)" : "var(--surface-secondary)",
          backgroundImage: isCheapest ? "var(--brand-gradient)" : undefined,
          color: isCheapest ? "white" : "var(--text-secondary)",
        }}
      >
        {rank ? `#${rank}` : (station.name ?? station.city)?.[0]?.toUpperCase() ?? "?"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{station.name ?? "Station"}</div>
        <div className="text-xs truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>
          {station.city}
          {station.distance != null && <span> · {formatDistance(station.distance)}</span>}
          {station.isAutomate24h && <span> · 24h/24</span>}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1.5">
        {mainPrice ? (
          <PriceTag price={mainPrice.price} size="sm" variant={variant} />
        ) : (
          <span className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>
            N/A
          </span>
        )}
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: "var(--text-tertiary)" }}>
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </Link>
  );
}
