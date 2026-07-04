"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceCommand } from "@/types/emergency";

type SpeechRecognitionResult = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResult>;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

/**
 * Heuristic keyword matcher. We translate spoken phrases into the small set of
 * actions we support; the PRD explicitly requires a visual confirmation step
 * before any call, so false-positive triggers only matter for the
 * confirmation prompt — never for blind-execution.
 */
function classify(transcript: string): VoiceCommand {
  const t = transcript.toLowerCase();
  if (/\b(ambulance|hospital|medical|911|112)\b/.test(t)) return "call_ambulance";
  if (/\b(police|cop|patrol|constable)\b/.test(t)) return "call_police";
  if (/\b(fire|truck|blaze|smoke)\b/.test(t)) return "call_fire";
  if (/\b(notify|family|contact|parents|message)\b/.test(t)) return "notify_family";
  return "unknown";
}

export type VoiceStatus = "idle" | "listening" | "denied" | "unsupported" | "processing";

export function useVoice() {
  const [transcript, setTranscript] = useState("");
  const [command, setCommand] = useState<VoiceCommand>("none");
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let combined = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        combined += event.results[i][0].transcript;
      }
      setTranscript(combined);
      if (event.results[event.results.length - 1].isFinal) {
        setStatus("processing");
        setCommand(classify(combined));
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setStatus("denied");
      } else {
        setStatus("idle");
      }
    };
    recognition.onend = () => {
      setStatus((prev) => (prev === "listening" ? "idle" : prev));
    };
    recognitionRef.current = recognition;
  }, []);

  const start = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    setTranscript("");
    setCommand("none");
    setStatus("listening");
    try {
      r.start();
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
