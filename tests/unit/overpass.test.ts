import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { fetchNearbyFacilities } from "@/lib/overpass";
import type { Coordinates } from "@/types/emergency";

const coord: Coordinates = { latitude: 12.9716, longitude: 77.5946 };
const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("fetchNearbyFacilities", () => {
  it("parses an Overpass response into EmergencyUnit[]", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elements: [
          {
            type: "node",
            id: 1,
            lat: 12.97,
            lon: 77.6,
            tags: { name: "Manipal Hospital" },
          },
          {
            type: "node",
            id: 2,
            lat: 12.98,
            lon: 77.61,
            tags: { name: "Cloudnine" },
          },
        ],
      }),
    } as unknown as Response);

    const units = await fetchNearbyFacilities(coord, "hospital");
    expect(units).toHaveLength(2);
    expect(units[0].name).toBe("Manipal Hospital");
    expect(units[0].type).toBe("hospital");
    expect(units[1].latitude).toBe(12.98);
  });

  it("falls back to type-default name when OSM tag is missing", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elements: [{ type: "node", id: 99, lat: 12.97, lon: 77.6 }],
      }),
    } as unknown as Response);

    const units = await fetchNearbyFacilities(coord, "police");
    expect(units[0].name).toMatch(/^Police #99$/);
  });

  it("returns an empty array on Overpass error (graceful degradation)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    } as unknown as Response);

    const units = await fetchNearbyFacilities(coord, "fire");
    expect(units).toEqual([]);
  });

  it("returns an empty array on network failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("offline"));
    const units = await fetchNearbyFacilities(coord, "fire");
    expect(units).toEqual([]);
  });
});
