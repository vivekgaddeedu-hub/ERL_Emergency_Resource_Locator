"use client";

import { Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EmergencyNumberEntry } from "@/lib/emergencyNumbers";
import { telLink } from "@/utils/calculateETA";

type EmergencyNumberProps = {
  entry: EmergencyNumberEntry;
  countryName: string | null;
};

export function EmergencyNumber({ entry, countryName }: EmergencyNumberProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-navy">
        <Phone className="h-5 w-5 text-foreground" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-muted">Local Emergency Number</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-foreground">{entry.number}</span>
          <Badge variant="default">{entry.iso}</Badge>
        </div>
        {countryName && <p className="truncate text-xs text-muted">Detected in {countryName}</p>}
      </div>
      <a
        href={telLink(entry.number)}
        className="inline-flex h-12 items-center gap-2 rounded-pill bg-emergency px-5 text-base font-semibold text-white transition-colors hover:bg-emergency-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emergency"
        aria-label={`Call ${entry.number}`}
      >
        <Phone className="h-4 w-4" aria-hidden /> Call
      </a>
    </Card>
  );
}

// re-export Button for consistent consumer imports
export { Button };
