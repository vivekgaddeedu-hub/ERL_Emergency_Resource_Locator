import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "emergency" | "green" | "amber" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: "bg-foreground text-background",
  emergency: "bg-emergency text-white",
  green: "bg-green text-background",
  amber: "bg-amber text-background",
  outline: "border border-border bg-card text-foreground",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-6 text-base",
};

export function Button({
  title,
  variant = "default",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        "items-center justify-center rounded-pill active:opacity-80",
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        className
      )}
      {...rest}
    >
      {children ?? (
        <Text
          className={cn(
            "font-semibold",
            variant === "default" || variant === "green" || variant === "amber"
              ? "text-background"
              : variant === "emergency"
              ? "text-white"
              : "text-foreground"
          )}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
