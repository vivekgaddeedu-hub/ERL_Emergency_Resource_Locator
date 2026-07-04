"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/hooks/useLocation";
import { lookupEmergencyNumber } from "@/lib/emergencyNumbers";
import { SOSButton } from "@/components/SOSButton";
import { EmergencyNumber } from "@/components/EmergencyNumber";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCoordinates } from "@/lib/emergencyNumbers";
import { fetchEmergencyUnits } from "@/lib/emergency";
import { batchFetchETA } from "@/lib/osrm";
import { rankUnits } from "@/utils/calculateETA";
import { Map } from "@/components/Map";
import type { EmergencyType, EmergencyUnit, ETAResult } from "@/types/emergency";
import { MapPin, ShieldCheck, Hospital as HospitalIcon } from "lucide-react";

export default function EmergencyScreen() {
  const router = useRouter();
  const { coordinates, country, displayName, loading, error, refresh } = useLocation({
    autoStart: true,
    realtime: true,
  });
  const [units, setUnits] = useState<EmergencyUnit[]>([]);
  const [resolving, setResolving] = useState(false);

  const emergencyEntry = useMemo(() => lookupEmergencyNumber(country), [country]);
  const sortedResults: ETAResult[] = useMemo(() => {
    if (!coordinates || units.length === 0) return [];
    return rankUnits(coordinates, units);
  }, [coordinates, units]);

  const topUnit = sortedResults[0];

  useEffect(() => {
    if (!coordinates) return;
    let cancelled = false;
    setResolving(true);

    (async () => {
      const target: EmergencyType = "hospital";
      const fetched = await fetchEmergencyUnits(coordinates, target, 8000, 8);
      const withEta = await batchFetchETA(coordinates, fetched);
      if (!cancelled) {
        setUnits(withEta);
      }
    })().finally(() => {
      if (!cancelled) {
        setResolving(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [coordinates]);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-navy font-display text-lg font-bold text-foreground"
          aria-hidden
        >
          U
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold text-foreground">You</h1>
          <p className="truncate text-xs text-muted">Emergency profile · Adult</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-pill border border-border px-3 py-2 text-xs text-foreground hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          aria-label="Refresh my location"
        >
          Refresh
        </button>
      </header>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" aria-hidden /> Current location
        </div>
        <p className="mt-1 truncate font-display text-base font-semibold text-foreground">
          {displayName ?? (loading ? "Locating…" : "Location unknown")}
        </p>
        <p className="text-xs text-muted">{formatCoordinates(coordinates)}</p>
        {error && (
          <p className="mt-1 text-xs text-amber">Using default location — {error}</p>
        )}
      </Card>

      <EmergencyNumber entry={emergencyEntry} countryName={country} />

      <Card className="flex flex-col items-center gap-3 p-6">
        <Badge variant={resolving ? "amber" : units.length > 0 ? "green" : "default"}>
          {resolving ? "Resolving responders…" : units.length > 0 ? "Active" : "Standby"}
        </Badge>
        <SOSButton onTrigger={() => router.push("/resources")} />
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="h-56 w-full">
          <Map origin={coordinates} units={units.slice(0, 6)} highlightId={topUnit?.unit.id} className="h-full w-full" />
        </div>
        {topUnit ? (
          <div className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Fastest responder</p>
              <p className="truncate font-display text-base font-semibold text-foreground">
                {topUnit.unit.name}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-bold text-green">{topUnit.etaLabel}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted">ETA</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 p-4 text-sm text-muted">
            <HospitalIcon className="h-4 w-4" aria-hidden />
            {resolving ? "Resolving nearby units…" : "Tap SOS to find the closest unit."}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <a
          href="/resources"
          className="rounded-2xl border border-border bg-card p-3 font-semibold text-foreground transition-colors hover:bg-navy"
        >
          <HospitalIcon className="mx-auto mb-1 h-5 w-5" aria-hidden /> Nearby
        </a>
        <a
          href="/family"
          className="rounded-2xl border border-border bg-card p-3 font-semibold text-foreground transition-colors hover:bg-navy"
        >
          <ShieldCheck className="mx-auto mb-1 h-5 w-5" aria-hidden /> Family
        </a>
        <a
          href="/voice"
          className="rounded-2xl border border-border bg-card p-3 font-semibold text-foreground transition-colors hover:bg-navy"
        >
          <MapPin className="mx-auto mb-1 h-5 w-5" aria-hidden /> Voice
        </a>
      </div>
    </div>
  );
}
