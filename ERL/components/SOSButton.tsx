"use client";

import { useState } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

type SOSButtonProps = {
  onTrigger?: () => void;
  /** Show a brief "SENT" confirmation banner after tap. */
  confirmOnTap?: boolean;
};

/**
 * Pixel-faithful Android emergency screen SOS button.
 * Single tap triggers the callback and shows a short confirmation state.
 */
export function SOSButton({ onTrigger, confirmOnTap = true }: SOSButtonProps) {
  const [pressed, setPressed] = useState(false);

  const handle = () => {
    if (confirmOnTap) {
      setPressed(true);
      window.setTimeout(() => setPressed(false), 2200);
    }
    onTrigger?.();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handle}
        aria-label="SOS — trigger emergency response"
        className="group relative flex h-44 w-44 items-center justify-center rounded-full bg-emergency text-3xl font-display font-bold uppercase tracking-widest text-white shadow-[0_0_60px_-12px_rgba(230,57,70,0.6)] transition-transform active:scale-95 animate-pulse-sos focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emergency/50"
      >
        <span className="flex flex-col items-center gap-1">
          <AlertOctagon className="h-7 w-7" aria-hidden />
          SOS
        </span>
      </button>
      <p className="text-center text-xs text-muted">Tap once. Resources will be alerted.</p>
      {pressed && (
        <div
          role="status"
          aria-live="polite"
          className="animate-fade-in rounded-pill border border-green/40 bg-green/10 px-4 py-2 text-sm font-semibold text-green"
        >
          ✓ SOS sent — sorting responders by ETA
        </div>
      )}
    </div>
  );
}

// re-export Button so consumer files can keep a single import path
export { Button };
