import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

type CardProps = ViewProps & {
  className?: string;
};

export function Card({ className, ...rest }: CardProps) {
  return (
    <View
      className={cn("rounded-2xl border border-border bg-card", className)}
      {...rest}
    />
  );
}
