"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_LOCATION,
  getCurrentPosition,
  reverseGeocode,
} from "@/lib/geolocation";
import type { Coordinates, LocationState } from "@/types/emergency";

/**
 * Detects the user's current location and reverse-geocodes it.
 *
 * - On permission denied / API error we fall back to a default location so
 *   the demo never goes blank, while surfacing the error in state.
 * - `realtime` mode watches position changes via expo-location and updates
 *   coordinates on every significant move (~25 m).
 */
export function useLocation(options: { autoStart?: boolean; realtime?: boolean } = {}) {
  const { autoStart = true, realtime = false } = options;
  const [state, setState] = useState<LocationState>({
    coordinates: null,
    country: null,
    displayName: null,
    loading: false,
    error: null,
  });

  const resolveLocation = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const coord = await getCurrentPosition();
      const { country, displayName } = await reverseGeocode(coord);
      setState({
        coordinates: coord,
        country,
        displayName,
        loading: false,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown location error";
      setState({
        coordinates: DEFAULT_LOCATION,
        country: null,
        displayName: "Bengaluru (default)",
        loading: false,
        error: message,
      });
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      void resolveLocation();
    }
  }, [autoStart, resolveLocation]);

  // Realtime tracking — re-fetches nearest facilities as the user moves.
  useEffect(() => {
    if (!realtime) return;
    let subscription: { remove: () => void } | null = null;
    (async () => {
      try {
        const Location = await import("expo-location");
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 15_000,
            distanceInterval: 25,
          },
          (position) => {
            const coord: Coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setState((s) => ({ ...s, coordinates: coord }));
          }
        );
      } catch {
        // Tracking unavailable — fall back to one-shot getCurrentPosition.
      }
    })();
    return () => {
      subscription?.remove();
    };
  }, [realtime]);

  return { ...state, refresh: resolveLocation };
}
