// Pure helpers for formatting and ranking emergency units.

import type { Coordinates, EmergencyUnit, ETAResult } from "@/types/emergency";
import { haversineMeters } from "@/lib/osrm";

/** Pretty-print seconds as "12 min" / "45 sec" / "1 h 5 min". */
export function formatEta(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours} h ${minutes} min`;
}

export function formatDistance(meters: number | null | undefined): string {
  if (meters == null) return "—";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Build the user-facing ETAResult list.
 * If OSRM returned ETAs, sort by *etaSeconds* (the headline metric).
 * Otherwise fall back to haversine ranking on distance, so the demo never hangs.
 */
export function rankUnits(
  origin: Coordinates,
  units: EmergencyUnit[]
): ETAResult[] {
  const allHaveEta = units.length > 0 && units.every((u) => typeof u.etaSeconds === "number");

  const annotated = units.map<ETAResult>((unit) => {
    if (allHaveEta) {
      return {
        unit,
        etaSeconds: unit.etaSeconds as number,
        distanceMeters: unit.distance ?? 0,
        etaLabel: formatEta(unit.etaSeconds),
      };
    }
    const distanceMeters = haversineMeters(origin, {
      latitude: unit.latitude,
      longitude: unit.longitude,
    });
    // Estimate ETA at 40 km/h average urban speed as a fallback.
    const fallbackEta = (distanceMeters / 1000) * (3600 / 40);
    return {
      unit,
      etaSeconds: fallbackEta,
      distanceMeters,
      etaLabel: formatEta(fallbackEta),
    };
  });

  annotated.sort((a, b) => a.etaSeconds - b.etaSeconds);
  return annotated;
}

/** Build a tel: deep link (works on mobile webviews). */
export function telLink(number: string): string {
  return `tel:${number.replace(/\s+/g, "")}`;
}

/** Build a Google Maps directions link. */
export function directionsLink(from: Coordinates, to: Coordinates): string {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", `${from.latitude},${from.longitude}`);
  url.searchParams.set("destination", `${to.latitude},${to.longitude}`);
  url.searchParams.set("travelmode", "driving");
  return url.toString();
}

/** Build a WhatsApp-style share link for family notifications. */
export function notifyLink(contact: { name: string; phone: string }, location: string): string {
  const message = `🚨 ERL Emergency Alert\n${contact.name}, I need help.\nMy current location: ${location}`;
  const url = new URL(`https://wa.me/${contact.phone.replace(/[^\d]/g, "")}`);
  url.searchParams.set("text", message);
  return url.toString();
}
