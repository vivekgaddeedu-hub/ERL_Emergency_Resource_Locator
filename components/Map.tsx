"use client";

import { useEffect, useRef } from "react";
import type { Coordinates, EmergencyUnit } from "@/types/emergency";

type MapProps = {
  origin: Coordinates | null;
  units: EmergencyUnit[];
  /** Unit ID to highlight (e.g. the top-ranked ETA result). */
  highlightId?: string;
  className?: string;
};

/**
 * Leaflet wrapper. We dynamically `import` leaflet at runtime to avoid SSR
 * window-reference errors, and we load the CSS via the `link` tag injected
 * in the root layout.
 */
export function Map({ origin, units, highlightId, className }: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const layerRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      // If a map already exists (StrictMode double-effect), reuse it.
      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: false,
        }).setView(
          [
            origin?.latitude ?? 12.9716,
            origin?.longitude ?? 77.5946,
          ],
          13
        );
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);
        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);
      }
      redraw(L);
    }

    function redraw(L: typeof import("leaflet")) {
      const map = mapRef.current as import("leaflet").Map | null;
      const layer = layerRef.current as import("leaflet").LayerGroup | null;
      if (!map || !layer) return;
      layer.clearLayers();

      if (origin) {
        const originIcon = L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;border-radius:9999px;background:#3DDC97;border:3px solid #0D0D0D;box-shadow:0 0 0 4px rgba(61,220,151,0.25)"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([origin.latitude, origin.longitude], { icon: originIcon })
          .bindTooltip("You", { direction: "top" })
          .addTo(layer);
      }

      for (const unit of units) {
        const isHighlighted = unit.id === highlightId;
        const color = isHighlighted ? "#3DDC97" : "#E63946";
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:${isHighlighted ? 28 : 22}px;height:${
            isHighlighted ? 28 : 22
          }px;border-radius:9999px;background:${color};border:3px solid #0D0D0D;display:flex;align-items:center;justify-content:center;color:#0D0D0D;font-size:11px;font-weight:700;">${
            unit.type === "hospital" ? "H" : unit.type === "police" ? "P" : "F"
          }</div>`,
          iconSize: [isHighlighted ? 28 : 22, isHighlighted ? 28 : 22],
          iconAnchor: [isHighlighted ? 14 : 11, isHighlighted ? 14 : 11],
        });
        L.marker([unit.latitude, unit.longitude], { icon })
          .bindTooltip(unit.name, { direction: "top" })
          .addTo(layer);
      }

      const points: [number, number][] = [];
      if (origin) points.push([origin.latitude, origin.longitude]);
      for (const u of units) points.push([u.latitude, u.longitude]);
      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }

    void init();

    return () => {
      cancelled = true;
      const map = mapRef.current as { remove: () => void } | null;
      if (map) {
        map.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.latitude, origin?.longitude, units, highlightId]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-full w-full"}
      aria-label="Nearby emergency resources"
    />
  );
}
