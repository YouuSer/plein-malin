"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { StationWithPrices, GeoPosition } from "@/lib/types";
import type { FuelType } from "@/lib/constants";
import { FRANCE_CENTER, FRANCE_DEFAULT_ZOOM } from "@/lib/constants";

interface StationMapProps {
  stations: StationWithPrices[];
  selectedFuel: FuelType;
  userPosition: GeoPosition;
  isDefaultPosition: boolean;
  onStationClick?: (station: StationWithPrices) => void;
}

function getMarkerColor(
  price: number,
  allPrices: number[]
): string {
  if (allPrices.length === 0) return "var(--price-mid)";
  const sorted = [...allPrices].sort((a, b) => a - b);
  const p20 = sorted[Math.floor(sorted.length * 0.2)] ?? price;
  const p80 = sorted[Math.floor(sorted.length * 0.8)] ?? price;
  if (price <= p20) return "#16a34a";
  if (price >= p80) return "#ef4444";
  return "#f59e0b";
}

export function StationMap({
  stations,
  selectedFuel,
  userPosition,
  isDefaultPosition,
  onStationClick,
}: StationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const userMarker = useRef<maplibregl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: isDefaultPosition
        ? [FRANCE_CENTER.lng, FRANCE_CENTER.lat]
        : [userPosition.lng, userPosition.lat],
      zoom: isDefaultPosition ? FRANCE_DEFAULT_ZOOM : 12,
      attributionControl: {},
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update user position
  useEffect(() => {
    if (!map.current || isDefaultPosition) return;

    if (userMarker.current) {
      userMarker.current.setLngLat([userPosition.lng, userPosition.lat]);
    } else {
      const el = document.createElement("div");
      el.className = "user-location-marker";
      el.style.cssText = `
        width: 16px; height: 16px;
        background: var(--accent);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 2px var(--accent), 0 2px 8px rgba(0,0,0,0.3);
      `;

      userMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat([userPosition.lng, userPosition.lat])
        .addTo(map.current);
    }

    map.current.flyTo({
      center: [userPosition.lng, userPosition.lat],
      zoom: 13,
      duration: 1500,
    });
  }, [userPosition, isDefaultPosition]);

  // Update station markers
  const updateMarkers = useCallback(() => {
    if (!map.current) return;

    // Remove old markers
    for (const m of markers.current) m.remove();
    markers.current = [];

    // Get all prices for color grading
    const allPrices = stations
      .map(
        (s) =>
          s.prices.find((p) => p.fuelType === selectedFuel)?.price ?? null
      )
      .filter((p): p is number => p !== null);

    for (const station of stations) {
      const mainPrice = station.prices.find(
        (p) => p.fuelType === selectedFuel
      );
      if (!mainPrice) continue;

      const color = getMarkerColor(mainPrice.price, allPrices);

      // Create custom marker element
      const el = document.createElement("div");
      el.style.cssText = `
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        color: white;
        background: ${color};
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        white-space: nowrap;
        font-family: inherit;
        line-height: 1.4;
        transition: transform 0.15s;
      `;
      el.textContent = mainPrice.price.toFixed(3);
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.15)";
        el.style.zIndex = "10";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.zIndex = "";
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([station.longitude, station.latitude])
        .addTo(map.current!);

      el.addEventListener("click", () => onStationClick?.(station));

      markers.current.push(marker);
    }
  }, [stations, selectedFuel, onStationClick]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Locate me button handler
  const flyToUser = useCallback(() => {
    if (!map.current || isDefaultPosition) return;
    map.current.flyTo({
      center: [userPosition.lng, userPosition.lat],
      zoom: 13,
      duration: 1000,
    });
  }, [userPosition, isDefaultPosition]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Locate me button */}
      {!isDefaultPosition && (
        <button
          onClick={flyToUser}
          className="absolute bottom-32 right-3 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-transform active:scale-95"
          style={{
            background: "var(--surface)",
            boxShadow: "var(--shadow-md)",
            border: "1px solid var(--border)",
          }}
          aria-label="Centrer sur ma position"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
            style={{ color: "var(--accent)" }}
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      )}
    </div>
  );
}
