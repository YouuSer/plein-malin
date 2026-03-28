import { GOUV_API_URL } from "./constants";

interface GouvRecord {
  id: string;
  adresse: string;
  ville: string;
  cp: string;
  departement?: string;
  latitude: string;
  longitude: string;
  geom?: { lat: number; lon: number };
  services_service?: string;
  horaires_automate_24_24?: string;
  gazole_prix?: string;
  gazole_maj?: string;
  sp95_prix?: string;
  sp95_maj?: string;
  sp98_prix?: string;
  sp98_maj?: string;
  e10_prix?: string;
  e10_maj?: string;
  e85_prix?: string;
  e85_maj?: string;
  gplc_prix?: string;
  gplc_maj?: string;
  gazole_rupture?: string;
  sp95_rupture?: string;
  sp98_rupture?: string;
  e10_rupture?: string;
  e85_rupture?: string;
  gplc_rupture?: string;
  nom?: string;
  marque?: string;
}

export interface ParsedStation {
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
  prices: ParsedPrice[];
}

export interface ParsedPrice {
  fuelType: string;
  price: number;
  updatedAt: string;
  shortage: string | null;
}

const FUEL_FIELDS = [
  { key: "gazole", type: "gazole" },
  { key: "sp95", type: "sp95" },
  { key: "sp98", type: "sp98" },
  { key: "e10", type: "e10" },
  { key: "e85", type: "e85" },
  { key: "gplc", type: "gplc" },
] as const;

function parseRecord(r: GouvRecord): ParsedStation | null {
  const lat = r.geom?.lat ?? parseFloat(r.latitude);
  const lon = r.geom?.lon ?? parseFloat(r.longitude);

  if (!lat || !lon || isNaN(lat) || isNaN(lon)) return null;

  const prices: ParsedPrice[] = [];
  for (const { key, type } of FUEL_FIELDS) {
    const priceStr = r[`${key}_prix` as keyof GouvRecord] as string | undefined;
    const majStr = r[`${key}_maj` as keyof GouvRecord] as string | undefined;
    const ruptureStr = r[`${key}_rupture` as keyof GouvRecord] as
      | string
      | undefined;

    if (priceStr) {
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        prices.push({
          fuelType: type,
          price: price,
          updatedAt: majStr ?? new Date().toISOString(),
          shortage: ruptureStr || null,
        });
      }
    }
  }

  if (prices.length === 0) return null;

  let services: string[] = [];
  if (r.services_service) {
    try {
      services =
        typeof r.services_service === "string"
          ? r.services_service.split("//").filter(Boolean)
          : [];
    } catch {
      services = [];
    }
  }

  return {
    id: r.id,
    name: r.marque || r.nom || null,
    address: r.adresse || "",
    city: r.ville || "",
    postalCode: r.cp || "",
    department: r.departement || null,
    latitude: lat,
    longitude: lon,
    services,
    isAutomate24h: r.horaires_automate_24_24 === "Oui",
    prices,
  };
}

/**
 * Fetch all stations from the gouv.fr open data API.
 * The API paginates at 100 records by default; we fetch in batches.
 */
export async function fetchAllStations(): Promise<ParsedStation[]> {
  const allStations: ParsedStation[] = [];
  const limit = 100;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${GOUV_API_URL}?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const records: GouvRecord[] = data.results ?? [];

    for (const record of records) {
      const station = parseRecord(record);
      if (station) allStations.push(station);
    }

    hasMore = records.length === limit;
    offset += limit;

    // Safety limit to avoid infinite loops
    if (offset > 15000) break;
  }

  return allStations;
}
