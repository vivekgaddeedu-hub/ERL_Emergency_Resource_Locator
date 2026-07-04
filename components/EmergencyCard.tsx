"use client";

import { Phone, ShieldAlert, Flame, Hospital, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ETAResult } from "@/types/emergency";
import { formatDistance, telLink, directionsLink } from "@/utils/calculateETA";
import type { Coordinates } from "@/types/emergency";

type EmergencyCardProps = {
  result: ETAResult;
  origin: Coordinates | null;
  onCall?: (number: string) => void;
  rank: number;
};

const ICON_MAP = {
  hospital: Hospital,
  police: ShieldAlert,
  fire: Flame,
} as const;

export function EmergencyCard({ result, origin, onCall, rank }: EmergencyCardProps) {
  const { unit, etaLabel, distanceMeters } = result;
  const Icon = ICON_MAP[unit.type];
  const callNumber = unit.type === "hospital" ? "112" : unit.type === "police" ? "100" : "101";

  return (
    <Card className="animate-slide-up border-border bg-card/80 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-navy">
          <Icon className="h-6 w-6 text-foreground" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant={rank === 0 ? "green" : "default"}>#{rank + 1}</Badge>
            {rank === 0 && (
              <Badge variant="green" className="uppercase tracking-wider">
                Fastest
              </Badge>
            )}
          </div>
          <h3 className="mt-1 truncate font-display text-base font-semibold text-foreground">
            {unit.name}
          </h3>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-display text-2xl font-bold text-green">{etaLabel}</span>
            <span className="text-xs text-muted">ETA</span>
            <span className="text-xs text-muted">· {formatDistance(distanceMeters)}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          variant="emergency"
          size="md"
          className="flex-1"
          onClick={() => onCall?.(callNumber)}
          aria-label={`Call ${unit.name}`}
        >
          <Phone className="h-4 w-4" aria-hidden /> Call
        </Button>
        {origin && (
          <a
            href={directionsLink(origin, { latitude: unit.latitude, longitude: unit.longitude })}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-pill border border-border bg-card px-5 text-base font-medium text-foreground transition-colors hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            aria-label={`Get directions to ${unit.name}`}
          >
            Directions
          </a>
        )}
      </div>
    </Card>
  );
}

export function EmergencyCardSkeleton() {
  return (
    <Card className="animate-pulse border-border bg-card/80 p-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-pill bg-navy" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/4 rounded bg-navy" />
          <div className="h-3 w-3/4 rounded bg-navy" />
          <div className="h-6 w-1/3 rounded bg-navy" />
        </div>
      </div>
    </Card>
  );
}

// `tel` and `X` are exported for parent screens that may reuse them.
export { telLink, X };
