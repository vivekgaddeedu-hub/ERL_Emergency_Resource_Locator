"use client";

import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Mic, MicOff, Volume2 } from "lucide-react-native";
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

  const finalise = () => {
    if (!awaitingConfirm || awaitingConfirm === "unknown" || awaitingConfirm === "none") return;
    onCommand?.(awaitingConfirm as Exclude<VoiceCommand, "none" | "unknown">);
    setIsActuated(true);
    setAwaitingConfirm(null);
    reset();
    setTimeout(() => setIsActuated(false), 2400);
  };

  const cancel = () => {
    setAwaitingConfirm(null);
    reset();
  };

  return (
    <Card className="items-center gap-4 p-6">
      <Badge
        variant={status === "denied" ? "emergency" : "default"}
      >
        {status === "unsupported"
          ? "Voice not supported on this device"
          : status === "denied"
          ? "Microphone permission denied"
          : isBusy
          ? "🎤 Listening…"
          : "Voice ready"}
      </Badge>

      <Pressable
        accessibilityLabel={isBusy ? "Stop listening" : "Start voice assistant"}
        onPress={isBusy ? stop : start}
        disabled={status === "denied" || status === "unsupported"}
        className={`h-32 w-32 items-center justify-center rounded-full active:opacity-80 ${
          isBusy
            ? "animate-pulse-sos bg-emergency"
            : "bg-navy"
        }`}
      >
        {isBusy ? (
          <Mic size={48} color="white" />
        ) : (
          <MicOff size={48} color="#F1FAEE" />
        )}
      </Pressable>

      <Text className="text-center text-sm text-muted">
        {transcript || DIALOGUE[command]}
      </Text>

      {awaitingConfirm && awaitingConfirm !== "unknown" && (
        <View className="animate-fade-in w-full rounded-2xl border border-amber/40 bg-amber/10 p-4">
          <Text className="text-center font-display text-lg font-semibold text-amber">
            {PROMPT[awaitingConfirm]}
          </Text>
          <Text className="mt-1 text-center text-xs text-muted">
            Visual confirmation required before any call.
          </Text>
          <View className="mt-3 flex-row justify-center gap-2">
            <Button variant="green" onPress={finalise} title="Yes, proceed" />
            <Button variant="outline" onPress={cancel} title="Cancel" />
          </View>
        </View>
      )}

      {isActuated && (
        <View className="animate-fade-in flex-row items-center rounded-pill border border-green/40 bg-green/10 px-4 py-2">
          <Volume2 size={16} color="#3DDC97" />
          <Text className="ml-2 text-sm font-semibold text-green">
            Command executed.
          </Text>
        </View>
      )}

      <Text className="text-center text-xs text-muted">
        Try: "Call ambulance" · "Call police" · "Notify family"
      </Text>
    </Card>
  );
}
