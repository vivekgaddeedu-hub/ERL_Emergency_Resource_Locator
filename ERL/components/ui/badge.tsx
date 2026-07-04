"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "emergency" | "green" | "amber" | "navy";
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const styles: Record<NonNullable<BadgeProps["variant"]>, string> = {
      default: "bg-card text-foreground border border-border",
      emergency: "bg-emergency text-white",
      green: "bg-green text-background",
      amber: "bg-amber text-background",
      navy: "bg-navy text-foreground",
    };
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold tracking-wide",
          styles[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
