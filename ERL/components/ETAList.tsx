"use client";

import { Hospital, ShieldAlert, Flame } from "lucide-react";
import { EmergencyCard, EmergencyCardSkeleton } from "@/components/EmergencyCard";
import type { ETAResult, Coordinates } from "@/types/emergency";
import { cn } from "@/lib/utils";

type ETAListProps = {
  results: ETAResult[];
  origin: Coordinates | null;
  activeType: "hospital" | "police" | "fire";
  onTypeChange: (type: "hospital" | "police" | "fire") => void;
  loading?: boolean;
  onCall?: (number: string) => void;
};

const TABS: Array<{
  key: "hospital" | "police" | "fire";
  label: string;
  icon: typeof Hospital;
}> = [
  { key: "hospital", label: "Hospital", icon: Hospital },
  { key: "police", label: "Police", icon: ShieldAlert },
  { key: "fire", label: "Fire", icon: Flame },
];

export function ETAList({
  results,
  origin,
  activeType,
  onTypeChange,
  loading,
  onCall,
}: ETAListProps) {
  return (
    <section aria-label="Nearby emergency resources">
      <div className="mb-4 flex gap-2" role="tablist">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeType === key}
            onClick={() => onTypeChange(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-pill px-4 py-3 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
              activeType === key
                ? "bg-foreground text-background"
                : "border border-border bg-card text-foreground hover:bg-navy"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <EmergencyCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted">
          No {activeType} units found nearby. Try a different category.
        </div>
      ) : (
        <ol className="grid gap-3" role="list">
          {results.map((r, i) => (
            <li key={r.unit.id}>
              <EmergencyCard result={r} origin={origin} onCall={onCall} rank={i} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
