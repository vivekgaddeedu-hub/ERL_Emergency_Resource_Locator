import { describe, expect, it } from "vitest";
import { formatEta, formatDistance, rankUnits, telLink, directionsLink, notifyLink } from "@/utils/calculateETA";
import { haversineMeters } from "@/lib/osrm";
import type { EmergencyUnit } from "@/types/emergency";

describe("formatEta", () => {
  it("formats seconds, minutes, and hours", () => {
    expect(formatEta(45)).toBe("45 sec");
    expect(formatEta(720)).toBe("12 min");
    expect(formatEta(3900)).toMatch(/^1 h \d+ min$/);
  });
  it("returns the dash for missing/NaN input", () => {
    expect(formatEta(null)).toBe("—");
    expect(formatEta(undefined)).toBe("—");
    expect(formatEta(Number.NaN)).toBe("—");
  });
});

describe("formatDistance", () => {
  it("formats meters and kilometers", () => {
    expect(formatDistance(450)).toBe("450 m");
    expect(formatDistance(2500)).toBe("2.5 km");
  });
  it("returns the dash for null", () => {
    expect(formatDistance(null)).toBe("—");
  });
});

describe("haversineMeters", () => {
  it("returns ~0 for identical coordinates", () => {
    const d = haversineMeters({ latitude: 12.97, longitude: 77.59 }, { latitude: 12.97, longitude: 77.59 });
    expect(d).toBeLessThan(1);
  });
  it("computes the Bengaluru→Mumbai distance within 50 km tolerance", () => {
    const d = haversineMeters(
      { latitude: 12.9716, longitude: 77.5946 },
      { latitude: 19.076, longitude: 72.8777 }
    );
    // Bengaluru → Mumbai is ~845 km straight-line.
    expect(d).toBeGreaterThan(800_000);
    expect(d).toBeLessThan(900_000);
  });
});

describe("rankUnits — the headline differentiator", () => {
  const origin = { latitude: 12.97, longitude: 77.59 };

  it("sorts by ETA seconds, not by haversine distance", () => {
    const farButFast: EmergencyUnit = {
      id: "1",
      name: "Far but highway",
      type: "hospital",
      latitude: 12.97,
      longitude: 78.0,
      distance: 50_000,
      etaSeconds: 60 * 12, // 12 min on highway
    };
    const closeButSlow: EmergencyUnit = {
      id: "2",
      name: "Close but congested",
      type: "hospital",
      latitude: 12.98,
      longitude: 77.6,
      distance: 1_200,
      etaSeconds: 60 * 25, // 25 min in traffic
    };

    const sorted = rankUnits(origin, [closeButSlow, farButFast]);
    expect(sorted[0].unit.id).toBe("1");
    expect(sorted[0].etaLabel).toBe("12 min");
    expect(sorted[1].unit.id).toBe("2");
  });

  it("falls back to haversine ranking when no ETAs are present", () => {
    const a: EmergencyUnit = { id: "a", name: "A", type: "hospital", latitude: 12.99, longitude: 77.6 };
    const b: EmergencyUnit = { id: "b", name: "B", type: "hospital", latitude: 12.972, longitude: 77.591 };
    const sorted = rankUnits(origin, [a, b]);
    expect(sorted[0].unit.id).toBe("b"); // b is closer
  });
});

describe("telLink", () => {
  it("strips whitespace and prefixes with tel:", () => {
    expect(telLink("+91 987 654 3210")).toBe("tel:+919876543210");
    expect(telLink("112")).toBe("tel:112");
  });
});

describe("directionsLink", () => {
  it("builds a Google Maps URL", () => {
    const url = directionsLink({ latitude: 12.97, longitude: 77.59 }, { latitude: 12.99, longitude: 77.6 });
    expect(url).toContain("google.com/maps/dir/");
    // URLSearchParams encodes commas — match the percent-encoded form.
    expect(decodeURIComponent(url)).toContain("12.97,77.59");
    expect(decodeURIComponent(url)).toContain("12.99,77.6");
    expect(url).toContain("travelmode=driving");
  });
});

describe("notifyLink", () => {
  it("builds a WhatsApp deep link with the contact phone and location", () => {
    const url = notifyLink({ name: "Mom", phone: "+91 987 654 3210" }, "MG Road, Bengaluru");
    expect(url).toContain("https://wa.me/919876543210");
    expect(url).toContain("MG+Road%2C+Bengaluru");
  });
});
