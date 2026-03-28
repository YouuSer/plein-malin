import type { FuelType } from "./constants";

export interface Station {
  id: string;
  name: string | null;
  address: string;
  city: string;
  postalCode: string;
  department: string | null;
  latitude: number;
  longitude: number;
  services: string[];
  isAutomate24h: boolean;
}

export interface StationPrice {
  fuelType: FuelType;
  price: number;
  updatedAt: string;
  shortage: "temporaire" | "definitive" | null;
}

export interface StationWithPrices extends Station {
  prices: StationPrice[];
  distance?: number; // km from user
}

export interface PriceHistoryPoint {
  price: number;
  recordedAt: string;
}

export interface GeoPosition {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export type VehicleType =
  | "citadine"
  | "berline"
  | "suv"
  | "monospace"
  | "utilitaire"
  | "moto"
  | "scooter";

export interface UserPreferences {
  preferredFuel: FuelType;
  vehicleType: VehicleType;
  tankSizeL: number;
  onboardingCompletedAt: string | null;
}
