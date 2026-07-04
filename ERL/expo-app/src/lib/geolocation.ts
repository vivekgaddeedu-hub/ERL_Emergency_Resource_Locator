// Geolocation helpers for the Expo app.
// Uses expo-location instead of the browser's navigator.geolocation,
// which works identically on iOS, Android, and (via expo-web) the web.

import * as Location from "expo-location";
import type { Coordinates } from "@/types/emergency";

export const DEFAULT_LOCATION: Coordinates = {
  // Bengaluru city centre — safe fallback so the demo never goes blank
  // if the user denies location permission.
  latitude: 12.9716,
  longitude: 77.5946,
};

export const LOCATION_TIMEOUT_MS = 8_000;

export async function getCurrentPosition(): Promise<Coordinates> {
  // Ask for foreground permission. The app never uses background location.
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission denied");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
    timeInterval: 1000,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export async function reverseGeocode(
  coord: Coordinates
): Promise<{ country: string | null; displayName: string | null }> {
  try {
    // Use the device-native reverse geocoder first (offline-friendly, fast).
    const native = await Location.reverseGeocodeAsync({
      latitude: coord.latitude,
      longitude: coord.longitude,
    });
    if (native.length > 0) {
      const first = native[0];
      return {
        country: first.country ?? null,
        displayName:
          [first.name, first.city, first.region, first.country]
            .filter(Boolean)
            .join(", ") || null,
      };
    }
  } catch {
    // Native geocoder unavailable — fall through to Nominatim.
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(coord.latitude));
    url.searchParams.set("lon", String(coord.longitude));
    url.searchParams.set("zoom", "14");
    url.searchParams.set("addressdetails", "1");
    const res = await fetch(url.toString(), {
      headers: { "Accept-Language": "en" },
    });
    if (!res.ok) return { country: null, displayName: null };
    const data = (await res.json()) as {
      address?: { country?: string };
      display_name?: string;
    };
    return {
      country: data.address?.country ?? null,
      displayName: data.display_name ?? null,
    };
  } catch {
    return { country: null, displayName: null };
  }
}
