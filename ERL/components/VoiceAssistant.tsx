"use client";

import { useEffect, useMemo, useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVoice } from "@/hooks/useVoice";
import type { VoiceCommand } from "@/types/emergency";

type VoiceAssistantProps = {
  onCommand?: (cmd: Exclude<VoiceCommand, "none" | "unknown">) => void;
};

const PROMPT: Record<VoiceCommand, string> = {
  none: "Tap the mic to begin",
  unknown: "I didn't catch that. Try \"Call ambulance\"",
  call_ambulance: "Call 112 (ambulance)?",
  call_police: "Call 100 (police)?",
  call_fire: "Call 101 (fire)?",
  notify_family: "Notify all family contacts?",
};

const DIALOGUE: Record<VoiceCommand, string> = {
  none: "Listening for emergency commands…",
  unknown: "Sorry, please repeat your command.",
  call_ambulance: "Calling 112 — ambulance",
  call_police: "Calling 100 — police",
  call_fire: "Calling 101 — fire",
  notify_family: "Opening family notify panel",
};

export function VoiceAssistant({ onCommand }: VoiceAssistantProps) {
  const { start, stop, reset, transcript, command, status } = useVoice();
  const [awaitingConfirm, setAwaitingConfirm] = useState<VoiceCommand | null>(null);
  const [isActuated, setIsActuated] = useState(false);

  const isBusy = status === "listening" || status === "processing";

  useEffect(() => {
    if (command !== "none" && command !== "unknown") {
      setAwaitingConfirm(command);
    }
  }, [command]);

  const confirmLabel = useMemo(() => PROMPT[awaitingConfirm ?? "none"], [awaitingConfirm]);
  const finalise = () => {
    if (!awaitingConfirm || awaitingConfirm === "unknown" || awaitingConfirm === "none") return;
    onCommand?.(awaitingConfirm as Exclude<VoiceCommand, "none" | "unknown">);
    setIsActuated(true);
    setAwaitingConfirm(null);
    reset();
    window.setTimeout(() => setIsActuated(false), 2400);
  };

  return (
    <Card className="flex flex-col gap-4 p-6 text-center">
      <div className="flex justify-center">
        <Badge variant={status === "denied" ? "emergency" : "default"}>
          {status === "unsupported"
            ? "Voice not supported in this browser"
            : status === "denied"
            ? "Microphone permission denied"
            : isBusy
            ? "🎤 Listening…"
            : "Voice ready"}
        </Badge>
      </div>

      <button
        type="button"
        onClick={isBusy ? stop : start}
        disabled={status === "denied" || status === "unsupported"}
        aria-label={isBusy ? "Stop listening" : "Start voice assistant"}
        className={`mx-auto flex h-32 w-32 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-4 ${
          isBusy
            ? "animate-pulse-sos bg-emergency text-white focus-visible:ring-emergency"
            : "bg-navy text-foreground hover:bg-navy/80 focus-visible:ring-foreground"
        }`}
      >
        {isBusy ? <Mic className="h-12 w-12" aria-hidden /> : <MicOff className="h-12 w-12" aria-hidden />}
      </button>

      <p className="text-sm text-muted">{transcript || DIALOGUE[command]}</p>

      {awaitingConfirm && awaitingConfirm !== "unknown" && (
        <div className="animate-fade-in rounded-2xl border border-amber/40 bg-amber/10 p-4">
          <p className="font-display text-lg font-semibold text-amber">{confirmLabel}</p>
          <p className="mt-1 text-xs text-muted">Visual confirmation required before any call.</p>
          <div className="mt-3 flex justify-center gap-2">
            <Button variant="green" onClick={confirmLabel ? finalise : undefined}>
              Yes, proceed
            </Button>
            <Button variant="outline" onClick={() => { setAwaitingConfirm(null); reset(); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isActuated && (
        <div className="animate-fade-in rounded-pill border border-green/40 bg-green/10 px-4 py-2 text-sm font-semibold text-green">
          <Volume2 className="mr-2 inline h-4 w-4" aria-hidden /> Command executed.
        </div>
      )}

      <p className="text-xs text-muted">
        Try: “Call ambulance” · “Call police” · “Notify family”
      </p>
    </Card>
  );
}
