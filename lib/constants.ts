export const FUEL_TYPES = {
  e10: {
    label: "E10",
    color: "#55b947",
    shortLabel: "E10",
    euCode: "E10",
    euLabel: "Sans plomb 95",
  },
  sp95: {
    label: "SP95",
    color: "#0e7c36",
    shortLabel: "E5",
    euCode: "E5",
    euLabel: "Sans plomb 95",
  },
  sp98: {
    label: "SP98",
    color: "#0f9a74",
    shortLabel: "E5/98",
    euCode: "E5",
    euLabel: "Sans plomb 98",
  },
  gazole: {
    label: "Gazole",
    color: "#e5d61c",
    shortLabel: "B7",
    euCode: "B7",
    euLabel: "Diesel",
  },
  e85: {
    label: "E85",
    color: "#31bee3",
    shortLabel: "E85",
    euCode: "E85",
    euLabel: "Superethanol",
  },
  gplc: {
    label: "GPLc",
    color: "#1f7ab5",
    shortLabel: "LPG",
    euCode: "LPG",
    euLabel: "Gaz de petrole liquefie",
  },
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
