import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { fetchETA, haversineMeters } from "@/lib/osrm";

// We stub the global fetch so tests are deterministic and offline.
const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("fetchETA — happy path", () => {
  it("parses a real OSRM response", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: "Ok",
        routes: [{ distance: 1234, duration: 333 }],
      }),
    } as unknown as Response);

    const eta = await fetchETA(
      { latitude: 12.97, longitude: 77.59 },
      { latitude: 12.99, longitude: 77.6 }
    );

    expect(eta).toEqual({ distanceMeters: 1234, etaSeconds: 333 });
  });

  it("returns null when the API responds with a non-Ok code", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ code: "NoRoute", routes: [] }),
    } as unknown as Response);

    const eta = await fetchETA(
      { latitude: 12.97, longitude: 77.59 },
      { latitude: 12.99, longitude: 77.6 }
    );
    expect(eta).toBeNull();
  });

  it("returns null on network failure (graceful degradation)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("offline"));

    const eta = await fetchETA(
      { latitude: 12.97, longitude: 77.59 },
      { latitude: 12.99, longitude: 77.6 }
    );
    expect(eta).toBeNull();
  });
});

describe("haversineMeters", () => {
  it("computes a reasonable Bengaluru → Mysuru distance", () => {
    const d = haversineMeters(
      { latitude: 12.2958, longitude: 76.6394 },
      { latitude: 12.9716, longitude: 77.5946 }
    );
    // ~128 km straight-line.
    expect(d).toBeGreaterThan(120_000);
    expect(d).toBeLessThan(140_000);
  });
});
