"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { DEFAULT_FUEL, type FuelType } from "@/lib/constants";
import type { GeoPosition } from "@/lib/types";

interface FuelFilterState {
  selectedFuel: FuelType;
  setSelectedFuel: (fuel: FuelType) => void;
  searchPosition: GeoPosition | null;
  searchLabel: string | null;
  setSearch: (pos: GeoPosition, label: string) => void;
  clearSearch: () => void;
}

const FuelFilterContext = createContext<FuelFilterState | null>(null);

export function FuelFilterProvider({ children }: { children: ReactNode }) {
  const [selectedFuel, setSelectedFuel] = useState<FuelType>(DEFAULT_FUEL);
  const [searchPosition, setSearchPosition] = useState<GeoPosition | null>(null);
  const [searchLabel, setSearchLabel] = useState<string | null>(null);

  const setSearch = useCallback((pos: GeoPosition, label: string) => {
    setSearchPosition(pos);
    setSearchLabel(label);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchPosition(null);
    setSearchLabel(null);
  }, []);

  return (
    <FuelFilterContext.Provider
      value={{
        selectedFuel,
        setSelectedFuel,
        searchPosition,
        searchLabel,
        setSearch,
        clearSearch,
      }}
    >
      {children}
    </FuelFilterContext.Provider>
  );
}

export function useFuelFilter() {
  const ctx = useContext(FuelFilterContext);
  if (!ctx) throw new Error("useFuelFilter must be used within FuelFilterProvider");
  return ctx;
}
