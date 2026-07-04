// Shared TypeScript types for the Emergency Resource Locator (ERL).
// These mirror the PRD §6 Supabase schema and §8 screen contracts.

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
  /** OSRM-computed driving distance in metres (null if not yet fetched) */
  distance?: number;
  /** OSRM-computed ETA in seconds (null if not yet fetched) */
  etaSeconds?: number;
};

export type FamilyContact = {
  id: string;
  name: string;
  relation: string;
  /** E.164-format phone number, e.g. +919876543210 */
  phone: string;
  photo?: string;
};

export type LocationState = {
  coordinates: Coordinates | null;
  /** Reverse-geocoded country name (used for emergency number lookup) */
  country: string | null;
  /** Human-readable area, e.g. "MG Road, Bengaluru" */
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
  /** Convenience: "12 min" / "45 sec" */
  etaLabel: string;
};
