"use client";

import { Pressable, Text, View } from "react-native";
import { Hospital, ShieldAlert, Flame } from "lucide-react-native";
import { EmergencyCard, EmergencyCardSkeleton } from "@/components/EmergencyCard";
import type { ETAResult, Coordinates, EmergencyType } from "@/types/emergency";
import { cn } from "@/lib/utils";

type ETAListProps = {
  results: ETAResult[];
  origin: Coordinates | null;
  activeType: EmergencyType;
  onTypeChange: (type: EmergencyType) => void;
  loading?: boolean;
  onCall?: (number: string) => void;
};

const TABS: Array<{
  key: EmergencyType;
  label: string;
  Icon: typeof Hospital;
}> = [
  { key: "hospital", label: "Hospital", Icon: Hospital },
  { key: "police", label: "Police", Icon: ShieldAlert },
  { key: "fire", label: "Fire", Icon: Flame },
];

export function ETAList({
  results,
  origin,
  activeType,
  onTypeChange,
  loading,
  onCall,
}: ETAListProps) {
  return (
    <View>
      <View className="mb-4 flex-row gap-2">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = activeType === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => onTypeChange(key)}
              className={cn(
                "h-12 flex-1 flex-row items-center justify-center gap-2 rounded-pill px-4 active:opacity-80",
                isActive
                  ? "bg-foreground"
                  : "border border-border bg-card"
              )}
            >
              <Icon
                size={16}
                color={isActive ? "#0D0D0D" : "#F1FAEE"}
              />
              <Text
                className={cn(
                  "text-sm font-semibold",
                  isActive ? "text-background" : "text-foreground"
                )}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View className="gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <EmergencyCardSkeleton key={i} />
          ))}
        </View>
      ) : results.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-border bg-card/50 p-8">
          <Text className="text-center text-sm text-muted">
            No {activeType} units found nearby. Try a different category.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {results.map((r, i) => (
            <EmergencyCard
              key={r.unit.id}
              result={r}
              origin={origin}
              onCall={onCall}
              rank={i}
            />
          ))}
        </View>
      )}
    </View>
  );
}
