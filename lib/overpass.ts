// Overpass API client. Returns nearby emergency facilities for a coordinate.
// We hit the public Overpass endpoint; it is free, OSM-backed, and rate-limited
// per IP — fine for a hackathon demo and a low-traffic public app.

import type { Coordinates, EmergencyType, EmergencyUnit } from "@/types/emergency";

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

/**
 * Maps our internal EmergencyType to one or more OSM amenity tags.
 * Order matters: we take the first non-empty match per category.
 */
const TAG_MAP: Record<EmergencyType, string[]> = {
  hospital: ["amenity=hospital", "amenity=clinic", "amenity=doctors"],
  police: ["amenity=police"],
  fire: ["amenity=fire_station"],
};

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { name?: string };
};

type OverpassResponse = {
  elements: OverpassElement[];
};

function fallbackFacilities(coord: Coordinates, type: EmergencyType): EmergencyUnit[] {
  const labels: Record<EmergencyType, string> = {
    hospital: "Demo Hospital",
    police: "Demo Police Station",
    fire: "Demo Fire Station",
  };
  const offsets: Record<EmergencyType, [number, number]> = {
    hospital: [0.0085, -0.005],
    police: [-0.007, 0.006],
    fire: [0.005, 0.007],
  };
  const [latOffset, lonOffset] = offsets[type];

  return [
    {
      id: `fallback-${type}`,
      name: `${labels[type]} (demo)`,
      type,
      latitude: coord.latitude + latOffset,
      longitude: coord.longitude + lonOffset,
    },
  ];
}

export async function fetchNearbyFacilities(
  coord: Coordinates,
  type: EmergencyType,
  radiusMeters = 8000,
  limit = 10
): Promise<EmergencyUnit[]> {
  const tagFilters = TAG_MAP[type]
    .map((t) => `node[${t}](around:${radiusMeters},${coord.latitude},${coord.longitude});`)
    .join("");

  const query = `[out:json][timeout:12];(${tagFilters});out ${limit};`;

  try {
    const res = await fetch(OVERPASS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: query }).toString(),
    });
    if (!res.ok) {
      // Overpass often 429s under load; fail gracefully with no units.
      return [];
    }
    const data = (await res.json()) as OverpassResponse;
    return data.elements
      .map((el) => {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (typeof lat !== "number" || typeof lon !== "number") return null;
        return {
          id: `${type}-${el.id}`,
          name: el.tags?.name ?? `${type[0].toUpperCase()}${type.slice(1)} #${el.id}`,
          type,
          latitude: lat,
          longitude: lon,
        } satisfies EmergencyUnit;
      })
      .filter((u): u is EmergencyUnit => u !== null);
  } catch {
    return [];
  }
}
