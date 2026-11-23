export type LatLng = { lat: number; lng: number };

export const ZONE_CENTER: LatLng = { lat: 47.49561, lng: 6.80544 };
export const ZONE_RADIUS_M = 3000;

const EARTH_RADIUS_M = 6371000;

export function distanceM(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function isInZone(point: LatLng): boolean {
  return distanceM(ZONE_CENTER, point) <= ZONE_RADIUS_M;
}

export function formatPosition({ lat, lng }: LatLng): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
