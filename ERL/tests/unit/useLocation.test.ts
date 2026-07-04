import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLocation } from "@/hooks/useLocation";

const originalGeolocation = navigator.geolocation;
const originalFetch = global.fetch;

beforeEach(() => {
  // mock geolocation
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn(),
    },
  });
  // mock fetch (for reverse geocoding)
  global.fetch = vi.fn();
});

afterEach(() => {
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: originalGeolocation });
  global.fetch = originalFetch;
});

describe("useLocation", () => {
  it("exposes a successful coordinate + country", async () => {
    (navigator.geolocation.getCurrentPosition as ReturnType<typeof vi.fn>).mockImplementationOnce(
      (success: PositionCallback) =>
        success({
          coords: { latitude: 12.97, longitude: 77.59, accuracy: 5 } as GeolocationCoordinates,
          timestamp: 0,
        } as GeolocationPosition)
    );

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        display_name: "Bengaluru, India",
        address: { country: "India" },
      }),
    } as unknown as Response);

    const { result } = renderHook(() => useLocation());
    await waitFor(() => expect(result.current.coordinates).not.toBeNull());
    expect(result.current.country).toBe("India");
    expect(result.current.error).toBeNull();
  });

  it("watches position updates in realtime mode", async () => {
    let watchSuccess: PositionCallback | null = null;

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) =>
          success({
            coords: { latitude: 12.97, longitude: 77.59, accuracy: 5 } as GeolocationCoordinates,
            timestamp: 0,
          } as GeolocationPosition)
        ),
        watchPosition: vi.fn((success: PositionCallback) => {
          watchSuccess = success;
          return 1;
        }),
        clearWatch: vi.fn(),
      },
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        display_name: "Bengaluru, India",
        address: { country: "India" },
      }),
    } as unknown as Response);

    const { result } = renderHook(() => useLocation({ autoStart: true, realtime: true }));
    await waitFor(() => expect(result.current.coordinates).not.toBeNull());
    expect(navigator.geolocation.watchPosition).toHaveBeenCalled();

    act(() => {
      watchSuccess?.({
        coords: { latitude: 13.00, longitude: 77.60, accuracy: 3 } as GeolocationCoordinates,
        timestamp: 0,
      } as GeolocationPosition);
    });

    expect(result.current.coordinates?.latitude).toBeCloseTo(13.0);
  });

  it("falls back to a default coordinate on permission denied", async () => {
    (navigator.geolocation.getCurrentPosition as ReturnType<typeof vi.fn>).mockImplementationOnce(
      (_: PositionCallback, error: PositionErrorCallback) =>
        error({ code: 1, message: "denied", PERMISSION_DENIED: 1 } as GeolocationPositionError)
    );

    const { result } = renderHook(() => useLocation());
    await waitFor(() => expect(result.current.coordinates).not.toBeNull());
    expect(result.current.coordinates?.latitude).toBeCloseTo(12.9716);
    expect(result.current.error).toMatch(/denied/);
  });
});
