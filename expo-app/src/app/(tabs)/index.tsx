import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, RefreshCcw, Hospital as HospitalIcon } from "lucide-react-native";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Linking, Platform } from "react-native";
import { SOSButton } from "@/components/SOSButton";
import { EmergencyNumber } from "@/components/EmergencyNumber";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map } from "@/components/Map";
import { useLocation } from "@/hooks/useLocation";
import { lookupEmergencyNumber, formatCoordinates } from "@/lib/emergencyNumbers";
import { fetchNearbyFacilities } from "@/lib/overpass";
import { batchFetchETA } from "@/lib/osrm";
import { rankUnits } from "@/utils/calculateETA";
import type { EmergencyUnit, ETAResult } from "@/types/emergency";

const REFRESH_INTERVAL_MS = 30_000; // Realtime: re-fetch every 30s

export default function EmergencyScreen() {
  const router = useRouter();
  const { coordinates, country, displayName, loading, error, refresh } =
    useLocation({ autoStart: true, realtime: true });

  const [units, setUnits] = useState<EmergencyUnit[]>([]);
  const [resolving, setResolving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const emergencyEntry = useMemo(() => lookupEmergencyNumber(country), [country]);

  const sortedResults: ETAResult[] = useMemo(() => {
    if (!coordinates || units.length === 0) return [];
    return rankUnits(coordinates, units);
  }, [coordinates, units]);

  const topUnit = sortedResults[0];

  // Realtime: re-fetch nearby hospitals whenever the user moves, plus a
  // periodic refresh so ETA data stays current while the app is open.
  const loadUnits = useCallback(async () => {
    if (!coordinates) return;
    setResolving(true);
    try {
      const fetched = await fetchNearbyFacilities(coordinates, "hospital", 8000, 8);
      const withEta = await batchFetchETA(coordinates, fetched);
      setUnits(withEta);
      setLastUpdated(new Date());
    } finally {
      setResolving(false);
    }
  }, [coordinates]);

  useEffect(() => {
    void loadUnits();
  }, [loadUnits]);

  useEffect(() => {
    const id = setInterval(() => {
      void loadUnits();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadUnits]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="px-4 pt-4">
          <View className="gap-5">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-pill bg-navy">
                <Text className="font-display text-lg font-bold text-foreground">
                  U
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-display text-lg font-semibold text-foreground">
                  You
                </Text>
                <Text className="text-xs text-muted">
                  Emergency profile · Adult
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Refresh my location"
                onPress={() => {
                  void refresh();
                  void loadUnits();
                }}
                className="rounded-pill border border-border px-3 py-2 active:opacity-80"
              >
                <View className="flex-row items-center gap-1">
                  <RefreshCcw size={12} color="#F1FAEE" />
                  <Text className="text-xs text-foreground">Refresh</Text>
                </View>
              </Pressable>
            </View>

            <Card className="p-4">
              <View className="flex-row items-center gap-2">
                <MapPin size={14} color="#8E8E93" />
                <Text className="text-xs text-muted">Current location</Text>
              </View>
              <Text
                className="mt-1 font-display text-base font-semibold text-foreground"
                numberOfLines={2}
              >
                {displayName ?? (loading ? "Locating…" : "Location unknown")}
              </Text>
              <Text className="text-xs text-muted">
                {formatCoordinates(coordinates)}
              </Text>
              {error && (
                <Text className="mt-1 text-xs text-amber">
                  Using default location — {error}
                </Text>
              )}
              {lastUpdated && (
                <Text className="mt-1 text-[10px] text-muted">
                  Last updated {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
            </Card>

            <EmergencyNumber
              entry={emergencyEntry}
              countryName={country}
            />

            <Card className="items-center gap-3 p-6">
              <Badge variant={resolving ? "amber" : "green"}>
                {resolving ? "Resolving responders…" : "Live"}
              </Badge>
              <SOSButton
                onTrigger={async () => {
                  const TEST_NUMBERS = [
                    "9121783185",
                    "7981312679",
                    "9381646146",
                    "9392679623",
                  ];
                  const msg = `EMERGENCY — need assistance. My location: ${coordinates?.latitude ?? "unknown"}, ${coordinates?.longitude ?? "unknown"}`;
                  try {
                    // Try to use expo-sms if available
                    // dynamic import so build doesn't fail when package isn't installed
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const SMS = await import("expo-sms");
                    if (SMS && SMS.isAvailableAsync) {
                      const available = await SMS.isAvailableAsync();
                      if (available) {
                        await SMS.sendSMSAsync(TEST_NUMBERS, msg);
                      } else {
                        const smsUrl = `sms:${TEST_NUMBERS.join(",")}${Platform.OS === "ios" ? "&" : "?"}body=${encodeURIComponent(msg)}`;
                        await Linking.openURL(smsUrl);
                      }
                    } else {
                      const smsUrl = `sms:${TEST_NUMBERS.join(",")}${Platform.OS === "ios" ? "&" : "?"}body=${encodeURIComponent(msg)}`;
                      await Linking.openURL(smsUrl);
                    }
                  } catch (e) {
                    // Fallback to Linking which opens the SMS app with prefilled message
                    try {
                      const smsUrl = `sms:${TEST_NUMBERS.join(",")}${Platform.OS === "ios" ? "&" : "?"}body=${encodeURIComponent(msg)}`;
                      await Linking.openURL(smsUrl);
                    } catch (err) {
                      console.warn("Unable to open SMS composer:", err);
                    }
                  }
                  // Navigate to resources view after sending
                  router.push("/resources");
                }}
              />
            </Card>

            <Card style={{ padding: 0, overflow: "hidden" }}>
              <Map
                origin={coordinates}
                units={units.slice(0, 6)}
                highlightId={topUnit?.unit.id}
                height={224}
              />
              {topUnit ? (
                <View className="flex-row items-center justify-between gap-3 p-4">
                  <View className="flex-1">
                    <Text className="text-xs uppercase tracking-wider text-muted">
                      Fastest responder
                    </Text>
                    <Text
                      className="font-display text-base font-semibold text-foreground"
                      numberOfLines={1}
                    >
                      {topUnit.unit.name}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-right font-display text-xl font-bold text-green">
                      {topUnit.etaLabel}
                    </Text>
                    <Text className="text-right text-[10px] uppercase tracking-widest text-muted">
                      ETA
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center justify-between gap-3 p-4">
                  <HospitalIcon size={16} color="#8E8E93" />
                  <Text className="flex-1 text-sm text-muted">
                    {resolving
                      ? "Resolving nearby units…"
                      : "Tap SOS to find the closest unit."}
                  </Text>
                </View>
              )}
            </Card>

            <View className="flex-row gap-2">
              <NavTile
                href="/resources"
                label="Nearby"
                icon={<HospitalIcon size={20} color="#F1FAEE" />}
              />
              <NavTile
                href="/family"
                label="Family"
                icon={<MapPin size={20} color="#F1FAEE" />}
              />
              <NavTile
                href="/voice"
                label="Voice"
                icon={<MapPin size={20} color="#F1FAEE" />}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NavTile({
  href,
  label,
  icon,
}: {
  href: "/resources" | "/family" | "/voice";
  label: string;
  icon: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(href)}
      className="flex-1 rounded-2xl border border-border bg-card p-3 active:opacity-80"
    >
      <View className="items-center">
        {icon}
        <Text className="mt-1 text-xs font-semibold text-foreground">
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
