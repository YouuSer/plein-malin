export const FUEL_TYPES = {
  e10: { label: "E10", color: "#16a34a", shortLabel: "E10" },
  sp95: { label: "SP95", color: "#2563eb", shortLabel: "95" },
  sp98: { label: "SP98", color: "#7c3aed", shortLabel: "98" },
  gazole: { label: "Gazole", color: "#1a1a2e", shortLabel: "GOil" },
  e85: { label: "E85", color: "#059669", shortLabel: "E85" },
  gplc: { label: "GPLc", color: "#d97706", shortLabel: "GPL" },
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
