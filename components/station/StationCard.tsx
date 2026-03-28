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
  showFreshness?: boolean;
  showQuickActions?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (stationId: string) => void | Promise<void>;
  favoriteDisabled?: boolean;
}

interface FreshnessInfo {
  label: string;
  color: string;
  background: string;
  border: string;
}

function getRelativeAgeLabel(date: Date) {
  const diffMin = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMin < 60) return `${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} j`;
}

function getFreshnessInfo(updatedAt?: string): FreshnessInfo {
  if (!updatedAt) {
    return {
      label: "MAJ inconnue",
      color: "var(--text-tertiary)",
      background: "var(--surface-secondary)",
      border: "var(--border)",
    };
  }

  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) {
    return {
      label: "MAJ inconnue",
      color: "var(--text-tertiary)",
      background: "var(--surface-secondary)",
      border: "var(--border)",
    };
  }

  const diffMin = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 60000));
  const ageLabel = getRelativeAgeLabel(parsed);

  if (diffMin < 30) {
    return {
      label: `MAJ ${ageLabel}`,
      color: "var(--price-low)",
      background: "var(--price-low-soft)",
      border: "rgba(10, 138, 102, 0.25)",
    };
  }

  if (diffMin < 120) {
    return {
      label: `MAJ ${ageLabel}`,
      color: "var(--text-secondary)",
      background: "var(--surface-secondary)",
      border: "var(--border)",
    };
  }

  return {
    label: `MAJ ${ageLabel}`,
    color: "var(--price-high)",
    background: "var(--price-high-soft)",
    border: "rgba(200, 63, 63, 0.25)",
  };
}

export function StationCard({
  station,
  selectedFuel,
  allPricesForFuel,
  rank,
  showFreshness = false,
  showQuickActions = false,
  isFavorited = false,
  onToggleFavorite,
  favoriteDisabled = false,
}: StationCardProps) {
  const mainPrice = station.prices.find((p) => p.fuelType === selectedFuel);
  const variant = mainPrice ? getPriceVariant(mainPrice.price, allPricesForFuel) : "neutral";
  const isCheapest = rank === 1;
  const freshness = getFreshnessInfo(mainPrice?.updatedAt);

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: "var(--surface)",
        border: `1px solid ${isCheapest ? "rgba(10, 138, 102, 0.26)" : "var(--border)"}`,
        boxShadow: isCheapest ? "var(--shadow-xs)" : "none",
      }}
    >
      <Link href={`/station/${station.id}`} className="flex items-center gap-3 transition-colors">
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

      {(showFreshness || showQuickActions) && (
        <div className="mt-2.5 pt-2.5 border-t flex items-center justify-between gap-2" style={{ borderColor: "var(--border)" }}>
          {showFreshness ? (
            <span
              className="text-[11px] font-semibold px-2 py-1 rounded-full"
              style={{
                color: freshness.color,
                background: freshness.background,
                border: `1px solid ${freshness.border}`,
              }}
            >
              {freshness.label}
            </span>
          ) : (
            <span />
          )}

          {showQuickActions && (
            <div className="flex items-center gap-1.5">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg"
                style={{
                  background: "var(--surface-secondary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                Itineraire
              </a>
              <button
                onClick={() => onToggleFavorite?.(station.id)}
                disabled={favoriteDisabled}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60"
                style={{
                  background: isFavorited ? "var(--price-high-soft)" : "var(--surface-secondary)",
                  color: isFavorited ? "var(--price-high)" : "var(--text-secondary)",
                  border: `1px solid ${isFavorited ? "rgba(200, 63, 63, 0.25)" : "var(--border)"}`,
                }}
              >
                <svg viewBox="0 0 20 20" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                  <path d="M10 17l-1.45-1.32C4.4 11.93 2 9.74 2 7.05 2 4.86 3.79 3 6 3c1.25 0 2.45.58 3.2 1.5C9.95 3.58 11.15 3 12.4 3 14.61 3 16.4 4.86 16.4 7.05c0 2.69-2.4 4.88-6.55 8.63L10 17z" />
                </svg>
                Favori
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
