"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_FUEL,
  DEFAULT_TANK_SIZE,
  FUEL_TYPE_KEYS,
  type FuelType,
} from "@/lib/constants";
import type { UserPreferences, VehicleType } from "@/lib/types";

export const USER_PREFERENCES_STORAGE_KEY = "pm_user_preferences_v1";

export const VEHICLE_TANK_PRESETS: Record<VehicleType, number> = {
  citadine: 42,
  berline: 55,
  suv: 65,
  monospace: 72,
  utilitaire: 80,
  moto: 20,
  scooter: 8,
};

const DEFAULT_VEHICLE: VehicleType = "berline";

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  preferredFuel: DEFAULT_FUEL,
  vehicleType: DEFAULT_VEHICLE,
  tankSizeL: DEFAULT_TANK_SIZE,
  onboardingCompletedAt: null,
};

function clampTankSize(value: number): number {
  return Math.min(140, Math.max(5, Math.round(value)));
}

function sanitizePreferredFuel(value: unknown): FuelType {
  if (typeof value === "string" && FUEL_TYPE_KEYS.includes(value as FuelType)) {
    return value as FuelType;
  }
  return DEFAULT_FUEL;
}

function sanitizeVehicleType(value: unknown): VehicleType {
  if (
    value === "citadine" ||
    value === "berline" ||
    value === "suv" ||
    value === "monospace" ||
    value === "utilitaire" ||
    value === "moto" ||
    value === "scooter"
  ) {
    return value;
  }
  return DEFAULT_VEHICLE;
}

function sanitizePreferences(raw: Partial<UserPreferences> | null | undefined): UserPreferences {
  const safeRaw = raw ?? {};
  const tankCandidate =
    typeof safeRaw.tankSizeL === "number"
      ? safeRaw.tankSizeL
      : VEHICLE_TANK_PRESETS[sanitizeVehicleType(safeRaw.vehicleType)];

  return {
    preferredFuel: sanitizePreferredFuel(safeRaw.preferredFuel),
    vehicleType: sanitizeVehicleType(safeRaw.vehicleType),
    tankSizeL: clampTankSize(tankCandidate),
    onboardingCompletedAt:
      typeof safeRaw.onboardingCompletedAt === "string" && safeRaw.onboardingCompletedAt.length > 0
        ? safeRaw.onboardingCompletedAt
        : null,
  };
}

interface UseUserPreferencesResult {
  preferences: UserPreferences;
  isHydrated: boolean;
  savePreferences: (patch: Partial<UserPreferences>) => void;
  markOnboardingCompleted: () => void;
}

export function useUserPreferences(): UseUserPreferencesResult {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<UserPreferences>;
        setPreferences(sanitizePreferences(parsed));
      }
    } catch {
      setPreferences(DEFAULT_USER_PREFERENCES);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const persist = useCallback((next: UserPreferences) => {
    setPreferences(next);
    try {
      localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // no-op in private mode or blocked storage
    }
  }, []);

  const savePreferences = useCallback(
    (patch: Partial<UserPreferences>) => {
      persist(sanitizePreferences({ ...preferences, ...patch }));
    },
    [preferences, persist]
  );

  const markOnboardingCompleted = useCallback(() => {
    persist(
      sanitizePreferences({
        ...preferences,
        onboardingCompletedAt: new Date().toISOString(),
      })
    );
  }, [preferences, persist]);

  return {
    preferences,
    isHydrated,
    savePreferences,
    markOnboardingCompleted,
  };
}
