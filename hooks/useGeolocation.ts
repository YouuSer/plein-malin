"use client";

import { useState, useEffect, useCallback } from "react";
import type { GeoPosition } from "@/lib/types";
import { FRANCE_CENTER } from "@/lib/constants";

interface GeolocationState {
  position: GeoPosition;
  loading: boolean;
  error: string | null;
  isDefault: boolean;
}

export function useGeolocation(): GeolocationState & { refresh: () => void } {
  const [state, setState] = useState<GeolocationState>({
    position: FRANCE_CENTER,
    loading: true,
    error: null,
    isDefault: true,
  });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Geolocalisation non supportee",
      }));
      return;
    }

    setState((s) => ({ ...s, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          loading: false,
          error: null,
          isDefault: false,
        });
      },
      (err) => {
        setState((s) => ({
          ...s,
          loading: false,
          error:
            err.code === 1
              ? "Acces a la position refuse"
              : "Impossible de determiner votre position",
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  return { ...state, refresh: locate };
}
