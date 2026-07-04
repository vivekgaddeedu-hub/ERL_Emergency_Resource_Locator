import { describe, expect, it } from "vitest";
import { lookupEmergencyNumber, formatCoordinates } from "@/lib/emergencyNumbers";

describe("lookupEmergencyNumber", () => {
  it("returns the correct number for the most common countries", () => {
    expect(lookupEmergencyNumber("India").number).toBe("112");
    expect(lookupEmergencyNumber("United States").number).toBe("911");
    expect(lookupEmergencyNumber("United Kingdom").number).toBe("999");
    expect(lookupEmergencyNumber("Japan").number).toBe("119");
    expect(lookupEmergencyNumber("Australia").number).toBe("000");
  });
  it("accepts USA alias", () => {
    expect(lookupEmergencyNumber("USA").number).toBe("911");
  });
  it("handles loose country-name matches", () => {
    expect(lookupEmergencyNumber("Republic of India").number).toBe("112");
  });
  it("falls back to 112 when the country is unknown", () => {
    expect(lookupEmergencyNumber("Atlantis").number).toBe("112");
    expect(lookupEmergencyNumber(null).number).toBe("112");
  });
});

describe("formatCoordinates", () => {
  it("formats with hemisphere letters and 4-decimal precision", () => {
    expect(formatCoordinates({ latitude: 12.9716, longitude: 77.5946 })).toBe("12.9716° N, 77.5946° E");
    expect(formatCoordinates({ latitude: -33.8688, longitude: 151.2093 })).toBe("33.8688° S, 151.2093° E");
  });
  it("returns the loading label for null input", () => {
    expect(formatCoordinates(null)).toBe("Locating…");
  });
});
