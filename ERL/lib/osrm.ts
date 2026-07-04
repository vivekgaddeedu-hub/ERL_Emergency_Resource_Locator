// OSRM driving-ETA client. We hit the public demo server at router.project-osrm.org,
// which is free for low-volume usage. The PRD explicitly locks this choice.

import type { Coordinates, EmergencyUnit } from "@/types/emergency";

const OSRM_BASE = "https://router.project-osrm.org";

type OSRMRoute = {
  distance: number; // metres
  duration: number; // seconds
};

type OSRMResponse = {
  code: string;
  routes: OSRMRoute[];
};

export type ETAEstimate = {
  distanceMeters: number;
  etaSeconds: number;
};

/**
 * Compute driving ETA from `origin` to a single destination.
 * Falls back to null on any error so callers can degrade gracefully.
 */
export async function fetchETA(
  origin: Coordinates,
  destination: Coordinates
): Promise<ETAEstimate | null> {
  const url = new URL(`${OSRM_BASE}/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`);
  url.searchParams.set("overview", "false");
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("steps", "false");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as OSRMResponse;
    if (data.code !== "Ok" || !data.routes?.[0]) return null;
    const route = data.routes[0];
    return { distanceMeters: route.distance, etaSeconds: route.duration };
  } catch {
    return null;
  }
}

/**
 * Fan out ETA requests to all units in parallel, returning the original array
 * hydrated with distance + etaSeconds. Failed individual requests keep their
 * undefined fields so the caller can fall back to a haversine sort.
 */
export async function batchFetchETA(
  origin: Coordinates,
  units: EmergencyUnit[]
): Promise<EmergencyUnit[]> {
  const results = await Promise.all(
    units.map(async (u) => {
      const eta = await fetchETA(origin, { latitude: u.latitude, longitude: u.longitude });
      if (!eta) return u;
      return { ...u, distance: eta.distanceMeters, etaSeconds: eta.etaSeconds };
    })
  );
  return results;
}

/**
 * Haversine fallback (used when OSRM is unreachable). This is the *honest*
 * distance-only ranking we explicitly avoid in the happy path.
 */
export function haversineMeters(a: Coordinates, b: Coordinates): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
