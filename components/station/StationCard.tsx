"use client";

import Link from "next/link";
import type { StationWithPrices } from "@/lib/types";
import { FUEL_TYPES, type FuelType } from "@/lib/constants";
import { PriceTag, getPriceVariant } from "@/components/ui/PriceTag";
import { formatDistance } from "@/lib/geo";

interface StationCardProps {
  station: StationWithPrices;
  selectedFuel: FuelType;
  allPricesForFuel: number[];
}

export function StationCard({
  station,
  selectedFuel,
  allPricesForFuel,
}: StationCardProps) {
  const mainPrice = station.prices.find((p) => p.fuelType === selectedFuel);
  const variant = mainPrice
    ? getPriceVariant(mainPrice.price, allPricesForFuel)
    : "neutral";

  return (
    <Link
      href={`/station/${station.id}`}
      className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:opacity-90"
      style={{
        background: "var(--surface-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Brand circle */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
        style={{
          background: "var(--accent-soft)",
          color: "var(--accent)",
        }}
      >
        {(station.name ?? station.city)?.[0]?.toUpperCase() ?? "?"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {station.name ?? "Station"}
        </div>
        <div
          className="text-xs truncate"
          style={{ color: "var(--text-secondary)" }}
        >
          {station.city}
          {station.distance != null && (
            <span style={{ color: "var(--text-tertiary)" }}>
              {" "}
              · {formatDistance(station.distance)}
            </span>
          )}
        </div>
        {station.isAutomate24h && (
          <span
            className="inline-flex items-center text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded-full"
            style={{
              background: "var(--price-low-soft)",
              color: "var(--price-low)",
            }}
          >
            24h/24
          </span>
        )}
      </div>

      {/* Price */}
      <div className="shrink-0">
        {mainPrice ? (
          <PriceTag price={mainPrice.price} size="sm" variant={variant} />
        ) : (
          <span
            className="text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            N/A
          </span>
        )}
      </div>
    </Link>
  );
}
