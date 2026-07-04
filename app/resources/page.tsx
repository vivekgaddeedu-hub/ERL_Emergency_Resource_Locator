"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import { fetchEmergencyUnits, subscribeEmergencyUnits } from "@/lib/emergency";
import { batchFetchETA } from "@/lib/osrm";
import { rankUnits, telLink } from "@/utils/calculateETA";
import { ETAList } from "@/components/ETAList";
import { Map } from "@/components/Map";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EmergencyType, EmergencyUnit, ETAResult } from "@/types/emergency";

export default function ResourcesScreen() {
  const { coordinates, loading: locating, error: locError } = useLocation({
    autoStart: true,
    realtime: true,
  });
  const [activeType, setActiveType] = useState<EmergencyType>("hospital");
  const [units, setUnits] = useState<EmergencyUnit[]>([]);
  const [resolving, setResolving] = useState(false);

  const load = useCallback(async () => {
    if (!coordinates) return;
    setResolving(true);
    try {
      const fetched = await fetchEmergencyUnits(coordinates, activeType, 8000, 10);
      const withEta = await batchFetchETA(coordinates, fetched);
      setUnits(withEta);
    } finally {
      setResolving(false);
    }
  }, [coordinates, activeType]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void load();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!coordinates) return;
    const cleanup = subscribeEmergencyUnits(() => {
      void load();
    });
    return cleanup;
  }, [coordinates, load]);

  const displayedUnits = useMemo<EmergencyUnit[]>(() => {
    if (!coordinates || resolving || locating || units.length > 0) {
      return units;
    }

    const offsetMap: Record<EmergencyType, [number, number]> = {
      hospital: [0.007, -0.005],
      police: [-0.006, 0.007],
      fire: [0.005, 0.006],
    };
    const [latOffset, lonOffset] = offsetMap[activeType];

    return [
      {
        id: `fallback-${activeType}`,
        name:
          activeType === "hospital"
            ? "Demo Hospital"
            : activeType === "police"
            ? "Demo Police Station"
            : "Demo Fire Station",
        type: activeType,
        latitude: coordinates.latitude + latOffset,
        longitude: coordinates.longitude + lonOffset,
      },
    ];
  }, [coordinates, units, activeType, resolving, locating]);

  const results: ETAResult[] = useMemo(
    () => (coordinates ? rankUnits(coordinates, displayedUnits) : []),
    [coordinates, displayedUnits]
  );
  const topUnit = results[0]?.unit;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground">Nearby Resources</h1>
        <p className="text-sm text-muted">Sorted by arrival time, not raw distance.</p>
      </header>

      <Card className="overflow-hidden p-0">
        <div className="h-64 w-full">
          <Map origin={coordinates} units={units} highlightId={topUnit?.id} className="h-full w-full" />
        </div>
        <div className="flex items-center justify-between border-t border-border p-4 text-xs text-muted">
          <span>{locating ? "Locating…" : locError ?? "Live position"}</span>
          <Badge variant="green">{units.length} found</Badge>
        </div>
      </Card>

      <ETAList
        results={results}
        origin={coordinates}
        activeType={activeType}
        onTypeChange={(t) => setActiveType(t)}
        loading={resolving || locating}
        onCall={(number) => {
          window.location.href = telLink(number);
        }}
      />

      <Button
        variant="amber"
        className="self-center"
        onClick={() => window.location.reload()}
        aria-label="Refresh nearby resources"
      >
        Refresh results
      </Button>
    </div>
  );
}
