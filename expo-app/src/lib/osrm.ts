// OSRM driving-ETA client. We hit the public demo server at
// router.project-osrm.org, which is free for low-volume usage.
// Identical to the Next.js client — fetch works the same in Expo.

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
  const url = new URL(
    `${OSRM_BASE}/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`
  );
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
 * hydrated with distance + etaSeconds.
 */
export async function batchFetchETA(
  origin: Coordinates,
  units: EmergencyUnit[]
): Promise<EmergencyUnit[]> {
  const results = await Promise.all(
    units.map(async (u) => {
      const eta = await fetchETA(origin, {
        latitude: u.latitude,
        longitude: u.longitude,
      });
      if (!eta) return u;
      return { ...u, distance: eta.distanceMeters, etaSeconds: eta.etaSeconds };
    })
  );
  return results;
}
