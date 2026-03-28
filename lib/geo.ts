import type { GeoPosition, BoundingBox } from "./types";

const EARTH_RADIUS_KM = 6371;

/** Haversine distance in km between two points */
export function haversineDistance(a: GeoPosition, b: GeoPosition): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLng = Math.sin(dLng / 2);
  const h =
    sinHalfLat * sinHalfLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinHalfLng * sinHalfLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Bounding box around a point with a given radius in km */
export function boundingBox(center: GeoPosition, radiusKm: number): BoundingBox {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos((center.lat * Math.PI) / 180));
  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

/** Format distance for display */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
