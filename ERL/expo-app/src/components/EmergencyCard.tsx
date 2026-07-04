"use client";

import { Linking, Pressable, Text, View } from "react-native";
import { Hospital, ShieldAlert, Flame, Phone } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ETAResult, Coordinates } from "@/types/emergency";
import { formatDistance, telLink, directionsLink } from "@/utils/calculateETA";

type EmergencyCardProps = {
  result: ETAResult;
  origin: Coordinates | null;
  onCall?: (number: string) => void;
  rank: number;
};

const ICON_MAP = {
  hospital: Hospital,
  police: ShieldAlert,
  fire: Flame,
} as const;

export function EmergencyCard({ result, origin, onCall, rank }: EmergencyCardProps) {
  const { unit, etaLabel, distanceMeters } = result;
  const Icon = ICON_MAP[unit.type];
  const callNumber =
    unit.type === "hospital" ? "112" : unit.type === "police" ? "100" : "101";

  return (
    <Card className="animate-slide-up p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-pill bg-navy">
          <Icon size={24} color="#F1FAEE" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Badge variant={rank === 0 ? "green" : "default"}>
              #{rank + 1}
            </Badge>
            {rank === 0 && (
              <Badge variant="green" className="uppercase tracking-wider">
                Fastest
              </Badge>
            )}
          </View>
          <Text
            className="mt-1 font-display text-base font-semibold text-foreground"
            numberOfLines={1}
          >
            {unit.name}
          </Text>
          <View className="mt-1 flex-row items-baseline gap-2">
            <Text className="font-display text-2xl font-bold text-green">
              {etaLabel}
            </Text>
            <Text className="text-xs text-muted">ETA</Text>
            <Text className="text-xs text-muted">
              · {formatDistance(distanceMeters)}
            </Text>
          </View>
        </View>
      </View>
      <View className="mt-3 flex-row gap-2">
        <Button
          variant="emergency"
          size="md"
          className="flex-1"
          onPress={() => onCall?.(callNumber)}
        >
          <View className="flex-row items-center gap-2">
            <Phone size={16} color="white" />
            <Text className="text-sm font-semibold text-white">Call</Text>
          </View>
        </Button>
        {origin && (
          <Pressable
            onPress={() =>
              Linking.openURL(
                directionsLink(origin, {
                  latitude: unit.latitude,
                  longitude: unit.longitude,
                })
              )
            }
            className="h-12 flex-1 items-center justify-center rounded-pill border border-border bg-card active:opacity-80"
          >
            <Text className="text-base font-medium text-foreground">
              Directions
            </Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

export function EmergencyCardSkeleton() {
  return (
    <Card className="animate-pulse p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 rounded-pill bg-navy" />
        <View className="flex-1 gap-2">
          <View className="h-4 w-1/4 rounded bg-navy" />
          <View className="h-3 w-3/4 rounded bg-navy" />
          <View className="h-6 w-1/3 rounded bg-navy" />
        </View>
      </View>
    </Card>
  );
}
