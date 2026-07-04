"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "bg-emergency text-white hover:bg-emergency-hover focus-visible:ring-emergency shadow-sm",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-card focus-visible:ring-foreground",
  ghost: "bg-transparent text-foreground hover:bg-card focus-visible:ring-foreground",
  emergency:
    "bg-emergency text-white hover:bg-emergency-hover focus-visible:ring-emergency shadow-sm",
  green: "bg-green text-background hover:brightness-110 focus-visible:ring-green shadow-sm",
  amber: "bg-amber text-background hover:brightness-110 focus-visible:ring-amber shadow-sm",
  navy: "bg-navy text-foreground hover:brightness-110 focus-visible:ring-navy shadow-sm",
};

const sizeVariants = {
  sm: "h-9 px-3 text-sm",
  md: "h-12 px-5 text-base",
  lg: "h-14 px-6 text-lg",
  icon: "h-12 w-12",
  sos: "h-44 w-44 text-2xl rounded-full",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof sizeVariants;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
