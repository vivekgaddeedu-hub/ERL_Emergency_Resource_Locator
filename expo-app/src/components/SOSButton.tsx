"use client";

import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AlertOctagon } from "lucide-react-native";
import { cn } from "@/lib/utils";

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
      setTimeout(() => setPressed(false), 2200);
    }
    onTrigger?.();
  };

  return (
    <View className="items-center gap-3">
      <Pressable
        accessibilityLabel="SOS — trigger emergency response"
        onPress={handle}
        className={cn(
          "h-44 w-44 items-center justify-center rounded-full bg-emergency active:scale-95",
          "animate-pulse-sos"
        )}
        style={{
          shadowColor: "#E63946",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 30,
          elevation: 12,
        }}
      >
        <View className="items-center gap-1">
          <AlertOctagon size={28} color="white" />
          <Text className="text-3xl font-display font-bold uppercase tracking-widest text-white">
            SOS
          </Text>
        </View>
      </Pressable>
      <Text className="text-center text-xs text-muted">
        Tap once. Resources will be alerted.
      </Text>
      {pressed && (
        <View className="animate-fade-in rounded-pill border border-green/40 bg-green/10 px-4 py-2">
          <Text className="text-sm font-semibold text-green">
            ✓ SOS sent — sorting responders by ETA
          </Text>
        </View>
      )}
    </View>
  );
}
