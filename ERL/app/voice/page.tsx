"use client";

import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { telLink } from "@/utils/calculateETA";
import type { VoiceCommand } from "@/types/emergency";

const COMMANDS: Array<{ key: Exclude<VoiceCommand, "none" | "unknown">; phrase: string; number: string }> = [
  { key: "call_ambulance", phrase: "Call ambulance", number: "112" },
  { key: "call_police", phrase: "Call police", number: "100" },
  { key: "call_fire", phrase: "Call fire", number: "101" },
  { key: "notify_family", phrase: "Notify family", number: "" },
];

export default function VoiceScreen() {
  const handleCommand = (cmd: Exclude<VoiceCommand, "none" | "unknown">) => {
    if (cmd === "notify_family") {
      window.location.href = "/family";
      return;
    }
    const match = COMMANDS.find((c) => c.key === cmd);
    if (!match) return;
    window.location.href = telLink(match.number);
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground">Voice Assistant</h1>
        <p className="text-sm text-muted">Hands-free, confirmation-gated. Nothing executes blind.</p>
      </header>

      <VoiceAssistant onCommand={handleCommand} />

      <Card className="p-4">
        <h2 className="mb-3 font-display text-base font-semibold text-foreground">Try saying</h2>
        <ul className="grid gap-2">
          {COMMANDS.map((c) => (
            <li key={c.key} className="flex items-center justify-between gap-3 rounded-pill border border-border bg-card/60 px-3 py-2 text-sm">
              <span className="text-foreground">“{c.phrase}”</span>
              {c.number ? (
                <Badge variant="default">{c.number}</Badge>
              ) : (
                <Badge variant="green">opens Family</Badge>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Voice uses your browser&apos;s Web Speech API. Chrome and Edge are best supported.
        </p>
      </Card>
    </div>
  );
}
