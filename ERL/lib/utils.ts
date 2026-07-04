// Lightweight class-name combiner. Tailwind-aware via `twMerge` so conflicts resolve correctly.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
