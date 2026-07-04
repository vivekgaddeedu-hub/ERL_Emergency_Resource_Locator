"use client";

import { Linking, Pressable, Text, View } from "react-native";
import { Phone } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EmergencyNumberEntry } from "@/lib/emergencyNumbers";
import { telLink } from "@/utils/calculateETA";

type EmergencyNumberProps = {
  entry: EmergencyNumberEntry;
  countryName: string | null;
};

export function EmergencyNumber({ entry, countryName }: EmergencyNumberProps) {
  return (
    <Card className="flex-row items-center gap-4 p-4">
      <View className="h-12 w-12 items-center justify-center rounded-pill bg-navy">
        <Phone size={20} color="#F1FAEE" />
      </View>
      <View className="flex-1">
        <Text className="text-xs uppercase tracking-wider text-muted">
          Local Emergency Number
        </Text>
        <View className="mt-0.5 flex-row items-center gap-2">
          <Text className="font-display text-2xl font-bold text-foreground">
            {entry.number}
          </Text>
          <Badge variant="default">{entry.iso}</Badge>
        </View>
        {countryName && (
          <Text className="text-xs text-muted" numberOfLines={1}>
            Detected in {countryName}
          </Text>
        )}
      </View>
      <Pressable
        accessibilityLabel={`Call ${entry.number}`}
        onPress={() => Linking.openURL(telLink(entry.number))}
        className="h-12 flex-row items-center gap-2 rounded-pill bg-emergency px-5 active:opacity-80"
      >
        <Phone size={16} color="white" />
        <Text className="text-base font-semibold text-white">Call</Text>
      </Pressable>
    </Card>
  );
}
