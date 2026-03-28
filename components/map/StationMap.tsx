"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Supercluster from "supercluster";
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

function getMarkerColor(price: number, allPrices: number[]): string {
  if (allPrices.length === 0) return "#f59e0b";
  const sorted = [...allPrices].sort((a, b) => a - b);
  const p20 = sorted[Math.floor(sorted.length * 0.2)] ?? price;
  const p80 = sorted[Math.floor(sorted.length * 0.8)] ?? price;
  if (price <= p20) return "#35a9db";
  if (price >= p80) return "#796fd8";
  return "#5fc5bf";
}

function isCheapest(price: number, allPrices: number[]): boolean {
  if (allPrices.length === 0) return false;
  const min = Math.min(...allPrices);
  return price === min;
}

type StationFeature = GeoJSON.Feature<
  GeoJSON.Point,
  { stationIndex: number; price: number; color: string; cheapest: boolean }
>;

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
  const clusterIndex = useRef<Supercluster | null>(null);

  const allPrices = useMemo(
    () =>
      stations
        .map((s) => s.prices.find((p) => p.fuelType === selectedFuel)?.price ?? null)
        .filter((p): p is number => p !== null),
    [stations, selectedFuel]
  );

  // Build supercluster index
  useEffect(() => {
    const features: StationFeature[] = [];

    for (let i = 0; i < stations.length; i++) {
      const s = stations[i];
      const mainPrice = s.prices.find((p) => p.fuelType === selectedFuel);
      if (!mainPrice) continue;

      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [s.longitude, s.latitude] },
        properties: {
          stationIndex: i,
          price: mainPrice.price,
          color: getMarkerColor(mainPrice.price, allPrices),
          cheapest: isCheapest(mainPrice.price, allPrices),
        },
      });
    }

    const index = new Supercluster({
      radius: 60,
      maxZoom: 14,
      map: (props) => ({
        priceSum: props.price,
        priceCount: 1,
        minPrice: props.price,
        color: props.color,
      }),
      reduce: (acc, props) => {
        acc.priceSum += props.priceSum;
        acc.priceCount += props.priceCount;
        acc.minPrice = Math.min(acc.minPrice, props.minPrice);
      },
    });

    index.load(features);
    clusterIndex.current = index;

    renderMarkers();
  }, [stations, selectedFuel, allPrices]);

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

    map.current.on("moveend", () => renderMarkers());
    map.current.on("zoomend", () => renderMarkers());

    // Resize map when container changes (e.g. sidebar collapse/expand)
    const ro = new ResizeObserver(() => {
      map.current?.resize();
    });
    ro.observe(mapContainer.current);

    return () => {
      ro.disconnect();
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
      el.style.cssText = `
        width: 18px; height: 18px;
        background: linear-gradient(135deg, #4eb9d6, #6e8ce8);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(78, 185, 214, 0.32), 0 2px 10px rgba(0,0,0,0.22);
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

  const renderMarkers = useCallback(() => {
    if (!map.current || !clusterIndex.current) return;

    for (const m of markers.current) m.remove();
    markers.current = [];

    const bounds = map.current.getBounds();
    const zoom = Math.floor(map.current.getZoom());

    const clusters = clusterIndex.current.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      zoom
    );

    for (const feature of clusters) {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;

      if (props.cluster) {
        const count = props.point_count;
        const minPrice = props.minPrice;
        const size = Math.min(48 + count * 0.3, 68);

        const el = document.createElement("div");
        el.style.cssText = `
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: linear-gradient(135deg, #74d3c6, #7ec4e3);
          color: white;
          border: 3px solid white;
          box-shadow: 0 6px 16px rgba(87, 170, 197, 0.34);
          font-family: inherit;
          line-height: 1;
          transition: transform 0.2s;
        `;
        el.innerHTML = `
          <span style="font-size:14px;font-weight:800">${count}</span>
          <span style="font-size:10px;opacity:0.9;font-weight:600">${minPrice.toFixed(3)}</span>
        `;

        el.addEventListener("click", () => {
          const expansionZoom = clusterIndex.current!.getClusterExpansionZoom(
            props.cluster_id
          );
          map.current!.flyTo({
            center: [lng, lat],
            zoom: expansionZoom,
            duration: 500,
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current!);
        markers.current.push(marker);
      } else {
        const station = stations[props.stationIndex];
        if (!station) continue;

        const el = document.createElement("div");
        const isBest = props.cheapest;
        el.style.cssText = `
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
          color: #fff;
          background: ${props.color};
          border: 2.5px solid white;
          box-shadow: 0 3px 12px rgba(24, 34, 48, 0.25);
          white-space: nowrap;
          font-family: inherit;
          line-height: 1.3;
          transition: transform 0.15s ease;
          ${isBest ? "animation: pulseGlow 2s ease-in-out infinite;" : ""}
        `;
        el.textContent = props.price.toFixed(3);
        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.2)";
          el.style.zIndex = "10";
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
          el.style.zIndex = "";
        });
        el.addEventListener("click", () => onStationClick?.(station));

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current!);
        markers.current.push(marker);
      }
    }
  }, [stations, onStationClick]);

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
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 66% 38%, rgba(112, 211, 199, 0.12), rgba(112, 211, 199, 0) 54%)",
        }}
      />

      {!isDefaultPosition && (
        <button
          onClick={flyToUser}
          className="absolute bottom-4 right-3 w-10 h-10 rounded-full flex items-center justify-center z-10 hover-lift"
          style={{
            background: "rgba(255,255,255,0.92)",
            boxShadow: "var(--shadow-md)",
            border: "1px solid var(--border)",
          }}
          aria-label="Centrer sur ma position"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth={2.5}
            className="w-4 h-4"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      )}
    </div>
  );
}
