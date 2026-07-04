import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshCcw } from "lucide-react-native";
import { ETAList } from "@/components/ETAList";
import { Map } from "@/components/Map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/useLocation";
import { fetchNearbyFacilities } from "@/lib/overpass";
import { batchFetchETA } from "@/lib/osrm";
import { rankUnits, telLink } from "@/utils/calculateETA";
import type { EmergencyType, EmergencyUnit, ETAResult } from "@/types/emergency";

const REFRESH_INTERVAL_MS = 30_000;

export default function ResourcesScreen() {
  const { coordinates, loading: locating, error: locError } = useLocation({
    autoStart: true,
    realtime: true,
  });
  const [activeType, setActiveType] = useState<EmergencyType>("hospital");
  const [units, setUnits] = useState<EmergencyUnit[]>([]);
  const [resolving, setResolving] = useState(false);

  const load = useCallback(async () => {
    if (!coordinates) return;
    setResolving(true);
    try {
      const fetched = await fetchNearbyFacilities(
        coordinates,
        activeType,
        8000,
        10
      );
      const withEta = await batchFetchETA(coordinates, fetched);
      setUnits(withEta);
    } finally {
      setResolving(false);
    }
  }, [coordinates, activeType]);

  useEffect(() => {
    void load();
  }, [load]);

  // Realtime: periodic re-fetch keeps the list fresh even when the user
  // is stationary but the surrounding world changes.
  useEffect(() => {
    const id = setInterval(() => {
      void load();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  const results: ETAResult[] = useMemo(
    () => (coordinates ? rankUnits(coordinates, units) : []),
    [coordinates, units]
  );
  const topUnit = results[0]?.unit;

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
                Nearby Resources
              </Text>
              <Text className="text-sm text-muted">
                Sorted by arrival time, not raw distance.
              </Text>
            </View>

            <Card style={{ padding: 0, overflow: "hidden" }}>
              <Map
                origin={coordinates}
                units={units}
                highlightId={topUnit?.id}
                height={256}
              />
              <View className="flex-row items-center justify-between border-t border-border p-4">
                <Text className="text-xs text-muted">
                  {locating
                    ? "Locating…"
                    : locError
                    ? locError
                    : "Live position"}
                </Text>
                <Badge variant="green">{units.length} found</Badge>
              </View>
            </Card>

            <ETAList
              results={results}
              origin={coordinates}
              activeType={activeType}
              onTypeChange={setActiveType}
              loading={resolving || locating}
              onCall={(number) => Linking.openURL(telLink(number))}
            />

            <View className="items-center">
              <Button
                variant="amber"
                onPress={() => {
                  void load();
                }}
              >
                <View className="flex-row items-center gap-2">
                  <RefreshCcw size={16} color="#0D0D0D" />
                  <Text className="text-sm font-semibold text-background">
                    Refresh results
                  </Text>
                </View>
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
