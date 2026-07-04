// Static emergency-number lookup by country name.

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
  { country: "Malaysia", number: "999", iso: "MY" },
  { country: "Thailand", number: "191", iso: "TH" },
  { country: "Philippines", number: "911", iso: "PH" },
  { country: "Vietnam", number: "113", iso: "VN" },
  { country: "Turkey", number: "112", iso: "TR" },
  { country: "Egypt", number: "122", iso: "EG" },
  { country: "Nigeria", number: "112", iso: "NG" },
  { country: "Kenya", number: "999", iso: "KE" },
  { country: "Argentina", number: "911", iso: "AR" },
  { country: "Chile", number: "133", iso: "CL" },
  { country: "Colombia", number: "123", iso: "CO" },
  { country: "Peru", number: "105", iso: "PE" },
  { country: "Switzerland", number: "112", iso: "CH" },
  { country: "Austria", number: "112", iso: "AT" },
  { country: "Netherlands", number: "112", iso: "NL" },
  { country: "Belgium", number: "112", iso: "BE" },
  { country: "Sweden", number: "112", iso: "SE" },
  { country: "Norway", number: "113", iso: "NO" },
  { country: "Denmark", number: "112", iso: "DK" },
  { country: "Finland", number: "112", iso: "FI" },
  { country: "Poland", number: "112", iso: "PL" },
  { country: "Ireland", number: "112", iso: "IE" },
  { country: "Portugal", number: "112", iso: "PT" },
  { country: "Greece", number: "112", iso: "GR" },
  { country: "Israel", number: "100", iso: "IL" },
];

/** Default fallback if country can't be resolved — India per PRD example. */
const FALLBACK = { country: "Unknown", number: "112", iso: "XX" } as const;

export function lookupEmergencyNumber(
  country: string | null | undefined
): EmergencyNumberEntry {
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
