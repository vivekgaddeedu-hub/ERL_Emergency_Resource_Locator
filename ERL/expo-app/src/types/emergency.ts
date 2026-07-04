// Shared TypeScript types for the Emergency Resource Locator (ERL) — Expo app.
// Mirrors the Next.js project's types/emergency.ts.

export type EmergencyType = "hospital" | "police" | "fire";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type EmergencyUnit = {
  id: string;
  name: string;
  type: EmergencyType;
  latitude: number;
  longitude: number;
  /** OSRM-computed driving distance in metres (undefined if not yet fetched) */
  distance?: number;
  /** OSRM-computed ETA in seconds (undefined if not yet fetched) */
  etaSeconds?: number;
};

export type FamilyContact = {
  id: string;
  name: string;
  relation: string;
  /** E.164-format phone number, e.g. +919876543210 */
  phone: string;
};

export type LocationState = {
  coordinates: Coordinates | null;
  country: string | null;
  displayName: string | null;
  loading: boolean;
  error: string | null;
};

export type VoiceCommand =
  | "call_ambulance"
  | "call_police"
  | "call_fire"
  | "notify_family"
  | "unknown"
  | "none";

export type ETAResult = {
  unit: EmergencyUnit;
  etaSeconds: number;
  distanceMeters: number;
  etaLabel: string;
};
