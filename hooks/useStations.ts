"use client";

import { useState, useEffect, useCallback } from "react";
import type { StationWithPrices, GeoPosition } from "@/lib/types";
import type { FuelType } from "@/lib/constants";

interface UseStationsResult {
  stations: StationWithPrices[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStations(
  position: GeoPosition,
  fuel: FuelType,
  radiusKm: number = 10
): UseStationsResult {
  const [stations, setStations] = useState<StationWithPrices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        lat: position.lat.toString(),
        lng: position.lng.toString(),
        radius: radiusKm.toString(),
        fuel,
      });

      const res = await fetch(`/api/stations?${params}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des stations");

      const data = await res.json();
      setStations(data.stations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [position.lat, position.lng, fuel, radiusKm]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return { stations, loading, error, refetch: fetchStations };
}
