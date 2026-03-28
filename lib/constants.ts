export const FUEL_TYPES = {
  e10: { label: "E10", color: "#0d9f6e", shortLabel: "E10" },
  sp95: { label: "SP95", color: "#06b6d4", shortLabel: "95" },
  sp98: { label: "SP98", color: "#8b5cf6", shortLabel: "98" },
  gazole: { label: "Gazole", color: "#475569", shortLabel: "GOil" },
  e85: { label: "E85", color: "#10b981", shortLabel: "E85" },
  gplc: { label: "GPLc", color: "#f59e0b", shortLabel: "GPL" },
} as const;

export type FuelType = keyof typeof FUEL_TYPES;

export const FUEL_TYPE_KEYS = Object.keys(FUEL_TYPES) as FuelType[];

export const DEFAULT_FUEL: FuelType = "e10";
export const DEFAULT_TANK_SIZE = 50; // liters
export const DEFAULT_RADIUS_KM = 10;
export const PRICE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const SYNC_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// France center coordinates
export const FRANCE_CENTER = { lat: 46.603354, lng: 1.888334 };
export const FRANCE_DEFAULT_ZOOM = 6;

// API
export const GOUV_API_URL =
  "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records";
