import { Text, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "green" | "amber" | "emergency";

type BadgeProps = TextProps & {
  variant?: BadgeVariant;
  className?: string;
};

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: "bg-navy text-foreground",
  green: "bg-green/20 text-green",
  amber: "bg-amber/20 text-amber",
  emergency: "bg-emergency/20 text-emergency",
};

export function Badge({ variant = "default", className, ...rest }: BadgeProps) {
  return (
    <Text
      className={cn(
        "self-start rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
        VARIANT_CLASS[variant],
        className
      )}
      {...rest}
    />
  );
}
