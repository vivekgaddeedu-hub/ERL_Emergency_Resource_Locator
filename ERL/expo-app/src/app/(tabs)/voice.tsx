import { ScrollView, Text, View, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { telLink } from "@/utils/calculateETA";
import type { VoiceCommand } from "@/types/emergency";

const COMMANDS: Array<{
  key: Exclude<VoiceCommand, "none" | "unknown">;
  phrase: string;
  number: string;
}> = [
  { key: "call_ambulance", phrase: "Call ambulance", number: "112" },
  { key: "call_police", phrase: "Call police", number: "100" },
  { key: "call_fire", phrase: "Call fire", number: "101" },
  { key: "notify_family", phrase: "Notify family", number: "" },
];

export default function VoiceScreen() {
  const handleCommand = (cmd: Exclude<VoiceCommand, "none" | "unknown">) => {
    if (cmd === "notify_family") {
      router.push("/family");
      return;
    }
    const match = COMMANDS.find((c) => c.key === cmd);
    if (!match) return;
    Linking.openURL(telLink(match.number));
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="px-4 pt-4">
          <View className="gap-5">
            <View>
              <Text className="font-display text-2xl font-bold text-foreground">
                Voice Assistant
              </Text>
              <Text className="text-sm text-muted">
                Hands-free, confirmation-gated. Nothing executes blind.
              </Text>
            </View>

            <VoiceAssistant onCommand={handleCommand} />

            <Card className="p-4">
              <Text className="mb-3 font-display text-base font-semibold text-foreground">
                Try saying
              </Text>
              <View className="gap-2">
                {COMMANDS.map((c) => (
                  <View
                    key={c.key}
                    className="flex-row items-center justify-between gap-3 rounded-pill border border-border bg-card/60 px-3 py-2"
                  >
                    <Text className="flex-1 text-sm text-foreground">
                      "{c.phrase}"
                    </Text>
                    {c.number ? (
                      <Badge variant="default">{c.number}</Badge>
                    ) : (
                      <Badge variant="green">opens Family</Badge>
                    )}
                  </View>
                ))}
              </View>
              <Text className="mt-3 text-xs text-muted">
                Voice uses your device's native speech recognition. iOS and
                Android are best supported.
              </Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
