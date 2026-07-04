// Static emergency-number lookup by country name. The PRD §6 marks this as a static
// JSON; we keep it in code so it's tree-shaken and zero-cost to load.

import type { Coordinates } from "@/types/emergency";

export type EmergencyNumberEntry = {
  /** Country name as returned by Nominatim (and a few common aliases) */
  country: string;
  /** Primary emergency number (police/medical/fire single line) */
  number: string;
  /** ISO country code, e.g. "IN" */
  iso: string;
};

const NUMBERS: EmergencyNumberEntry[] = [
  { country: "India", number: "112", iso: "IN" },
  { country: "United States", number: "911", iso: "US" },
  { country: "USA", number: "911", iso: "US" },
  { country: "United Kingdom", number: "999", iso: "GB" },
  { country: "UK", number: "999", iso: "GB" },
  { country: "Japan", number: "119", iso: "JP" },
  { country: "Australia", number: "000", iso: "AU" },
  { country: "Canada", number: "911", iso: "CA" },
  { country: "Germany", number: "112", iso: "DE" },
  { country: "France", number: "112", iso: "FR" },
  { country: "Italy", number: "112", iso: "IT" },
  { country: "Spain", number: "112", iso: "ES" },
  { country: "Brazil", number: "190", iso: "BR" },
  { country: "Mexico", number: "911", iso: "MX" },
  { country: "China", number: "110", iso: "CN" },
  { country: "Russia", number: "112", iso: "RU" },
  { country: "South Africa", number: "10111", iso: "ZA" },
  { country: "Singapore", number: "995", iso: "SG" },
  { country: "United Arab Emirates", number: "999", iso: "AE" },
  { country: "Saudi Arabia", number: "911", iso: "SA" },
  { country: "New Zealand", number: "111", iso: "NZ" },
  { country: "South Korea", number: "112", iso: "KR" },
  { country: "Indonesia", number: "112", iso: "ID" },
  { country: "Pakistan", number: "15", iso: "PK" },
  { country: "Bangladesh", number: "999", iso: "BD" },
  { country: "Sri Lanka", number: "119", iso: "LK" },
  { country: "Nepal", number: "100", iso: "NP" },
];

/** Default fallback if country can't be resolved — India per PRD example. */
const FALLBACK = { country: "Unknown", number: "112", iso: "XX" } as const;

export function lookupEmergencyNumber(country: string | null | undefined): EmergencyNumberEntry {
  if (!country) return FALLBACK;
  const direct = NUMBERS.find(
    (n) => n.country.toLowerCase() === country.toLowerCase()
  );
  if (direct) return direct;
  // Loose match — handles cases like "India" inside "Republic of India"
  const partial = NUMBERS.find((n) =>
    country.toLowerCase().includes(n.country.toLowerCase())
  );
  return partial ?? FALLBACK;
}

export function formatCoordinates(coord: Coordinates | null | undefined): string {
  if (!coord) return "Locating…";
  const lat = Math.abs(coord.latitude).toFixed(4);
  const lng = Math.abs(coord.longitude).toFixed(4);
  const ns = coord.latitude >= 0 ? "N" : "S";
  const ew = coord.longitude >= 0 ? "E" : "W";
  return `${lat}° ${ns}, ${lng}° ${ew}`;
}
