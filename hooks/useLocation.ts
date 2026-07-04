"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_LOCATION, getCurrentPosition, initialLocationState, reverseGeocode } from "@/lib/geolocation";
import type { LocationState } from "@/types/emergency";

/**
 * Detects the user's current location and reverse-geocodes it.
 *
 * - `refresh()` re-runs the lookup (useful after a manual retry tap).
 * - On permission denied / API error we fall back to a default location so
 *   the demo never goes blank, while surfacing the error in state.
 */
export function useLocation(
  options: boolean | { autoStart?: boolean; realtime?: boolean } = true
) {
  const { autoStart = true, realtime = false } =
    typeof options === "boolean" ? { autoStart: options, realtime: false } : options;
  const [state, setState] = useState<LocationState>(initialLocationState());

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
      const message = err instanceof Error ? err.message : "Unknown location error";
      // Fall back to default location so the demo continues.
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

  useEffect(() => {
    if (!realtime || typeof window === "undefined" || !navigator.geolocation?.watchPosition) {
      return;
    }

    let watchId: number | null = null;
    try {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coord = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setState((s) => ({ ...s, coordinates: coord }));
        },
        () => {
          // Ignore transient watch errors; initial fallback already covers the user.
        },
        {
          enableHighAccuracy: true,
          maximumAge: 15000,
          timeout: 15000,
        }
      );
    } catch {
      // Watch unsupported or blocked.
    }

    return () => {
      if (watchId !== null && navigator.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [realtime]);

  return { ...state, refresh: resolveLocation };
}
