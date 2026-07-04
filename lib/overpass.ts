// Overpass API client. Returns nearby emergency facilities for a coordinate.
// We hit the public Overpass endpoint; it is free, OSM-backed, and rate-limited
// per IP — fine for a hackathon demo and a low-traffic public app.

import type { Coordinates, EmergencyType, EmergencyUnit } from "@/types/emergency";

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

const QUERY_MAP: Record<EmergencyType, string> = {
  hospital: "hospital",
  police: "police station",
  fire: "fire station",
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

type NominatimResult = {
  place_id?: number;
  lat?: string;
  lon?: string;
  name?: string;
  display_name?: string;
};

type NominatimResponse = NominatimResult[];

function buildViewBox(coord: Coordinates, radiusMeters: number): string {
  const metersPerDegreeLat = 111_320;
  const latDelta = Math.max(0.02, Math.min(0.2, radiusMeters / metersPerDegreeLat));
  const lonDelta = Math.max(
    0.02,
    Math.min(0.2, radiusMeters / (111_320 * Math.cos((coord.latitude * Math.PI) / 180)))
  );

  return `${coord.longitude - lonDelta},${coord.latitude + latDelta},${coord.longitude + lonDelta},${coord.latitude - latDelta}`;
}

function parseOverpassResponse(data: OverpassResponse, type: EmergencyType): EmergencyUnit[] {
  return data.elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (typeof lat !== "number" || typeof lon !== "number") return null;
      return {
        id: `${el.type}-${el.id}`,
        name: el.tags?.name ?? `${type[0].toUpperCase()}${type.slice(1)} #${el.id}`,
        type,
        latitude: lat,
        longitude: lon,
      } satisfies EmergencyUnit;
    })
    .filter((u): u is EmergencyUnit => u !== null);
}

function parseNominatimResponse(data: NominatimResponse, type: EmergencyType): EmergencyUnit[] {
  return data
    .filter((item) => item.lat && item.lon)
    .slice(0, 8)
    .map((item) => ({
      id: `${type}-${item.place_id ?? item.lat ?? item.lon}`,
      name: item.name ?? item.display_name?.split(",")[0] ?? `${type[0].toUpperCase()}${type.slice(1)} nearby`,
      type,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
    }))
    .filter((unit) => Number.isFinite(unit.latitude) && Number.isFinite(unit.longitude));
}

export async function fetchNearbyFacilities(
  coord: Coordinates,
  type: EmergencyType,
  radiusMeters = 8000,
  limit = 10
): Promise<EmergencyUnit[]> {
  const query = QUERY_MAP[type];
  const searchUrl = new URL(NOMINATIM_ENDPOINT);
  searchUrl.searchParams.set("format", "jsonv2");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("limit", String(limit));
  searchUrl.searchParams.set("viewbox", buildViewBox(coord, radiusMeters));
  searchUrl.searchParams.set("bounded", "1");
  searchUrl.searchParams.set("addressdetails", "1");

  try {
    const res = await fetch(searchUrl.toString(), {
      headers: { "Accept-Language": "en", "User-Agent": "ERL/1.0" },
    });

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as NominatimResponse | OverpassResponse | unknown;
    if (Array.isArray(data)) {
      return parseNominatimResponse(data, type);
    }

    if (data && typeof data === "object" && "elements" in data) {
      const overpassData = data as OverpassResponse;
      return parseOverpassResponse(overpassData, type);
    }

    return [];
  } catch {
    return [];
  }
}
