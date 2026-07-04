"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceCommand } from "@/types/emergency";

/**
 * Heuristic keyword matcher — same as the Next.js app.
 * Visual confirmation is required before any call is placed, so a false
 * positive only ever shows a confirmation prompt; nothing executes blind.
 */
function classify(transcript: string): VoiceCommand {
  const t = transcript.toLowerCase();
  if (/\b(ambulance|hospital|medical|911|112)\b/.test(t)) return "call_ambulance";
  if (/\b(police|cop|patrol|constable)\b/.test(t)) return "call_police";
  if (/\b(fire|truck|blaze|smoke)\b/.test(t)) return "call_fire";
  if (/\b(notify|family|contact|parents|message)\b/.test(t)) return "notify_family";
  return "unknown";
}

export type VoiceStatus =
  | "idle"
  | "listening"
  | "denied"
  | "unsupported"
  | "processing";

/**
 * Voice recognition hook for Expo.
 *
 * Uses `expo-speech-recognition` when available (Expo Go and standalone builds).
 * Falls back to a graceful "unsupported" state on web.
 */
export function useVoice() {
  const [transcript, setTranscript] = useState("");
  const [command, setCommand] = useState<VoiceCommand>("none");
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const recognitionRef = useRef<{
    start: (opts: object) => void;
    stop: () => void;
    abort: () => void;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Dynamically import so the app still loads on platforms where
        // the native module isn't linked (e.g., web in Expo Go).
        const mod = await import("expo-speech-recognition");
        if (!mounted) return;
        const ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
        if (!ExpoSpeechRecognitionModule) {
          setStatus("unsupported");
          return;
        }
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!result.granted) {
          setStatus("denied");
          return;
        }

        const recognizer = new ExpoSpeechRecognitionModule.SpeechRecognizer();
        recognizer.onresult = (event: { results: Array<{ transcript: string }> }) => {
          const combined = event.results.map((r) => r.transcript).join(" ");
          setTranscript(combined);
          setCommand(classify(combined));
          setStatus("processing");
        };
        recognizer.onerror = (event: { error: string }) => {
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setStatus("denied");
          } else {
            setStatus("idle");
          }
        };
        recognizer.onend = () => {
          setStatus((prev) => (prev === "listening" ? "idle" : prev));
        };
        recognitionRef.current = recognizer;
      } catch {
        setStatus("unsupported");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const start = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    setTranscript("");
    setCommand("none");
    setStatus("listening");
    try {
      r.start({ lang: "en-US", interimResults: true });
    } catch {
      setStatus("idle");
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setCommand("none");
    setStatus("idle");
  }, []);

  return { start, stop, reset, transcript, command, status };
}
