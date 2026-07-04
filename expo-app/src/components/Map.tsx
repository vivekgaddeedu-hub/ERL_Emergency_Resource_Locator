"use client";

import { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, UrlTile, type Region } from "react-native-maps";
import type { Coordinates, EmergencyUnit } from "@/types/emergency";

type MapProps = {
  origin: Coordinates | null;
  units: EmergencyUnit[];
  /** Unit ID to highlight (e.g. the top-ranked ETA result). */
  highlightId?: string;
  height?: number;
};

/**
 * Map component for React Native.
 *
 * Uses OpenStreetMap raster tiles (no API key required) via react-native-maps'
 * `UrlTile`. This works in Expo Go without a Google Maps key.
 */
export function Map({ origin, units, highlightId, height = 224 }: MapProps) {
  const initialRegion: Region = useMemo(
    () => ({
      latitude: origin?.latitude ?? 12.9716,
      longitude: origin?.longitude ?? 77.5946,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }),
    [origin?.latitude, origin?.longitude]
  );

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!origin || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      },
      500
    );
  }, [origin]);

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        ref={mapRef}
        initialRegion={initialRegion}
        showsCompass
        showsScale
        toolbarEnabled={false}
        loadingEnabled
      >
        {/* OSM tile layer — no API key needed. */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {origin && (
          <Marker
            coordinate={{
              latitude: origin.latitude,
              longitude: origin.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            title="You"
          >
            <View style={styles.youMarker} />
          </Marker>
        )}

        {units.map((unit) => {
          const isHighlighted = unit.id === highlightId;
          const letter = unit.type === "hospital" ? "H" : unit.type === "police" ? "P" : "F";
          return (
            <Marker
              key={unit.id}
              coordinate={{
                latitude: unit.latitude,
                longitude: unit.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              title={unit.name}
            >
              <View
                style={[
                  styles.unitMarker,
                  isHighlighted ? styles.unitMarkerHighlight : null,
                ]}
              >
                <Text
                  style={[
                    styles.unitMarkerLetter,
                    isHighlighted ? styles.unitMarkerLetterHighlight : null,
                  ]}
                >
                  {letter}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  youMarker: {
    width: 18,
    height: 18,
    borderRadius: 9999,
    backgroundColor: "#3DDC97",
    borderWidth: 3,
    borderColor: "#0D0D0D",
    shadowColor: "#3DDC97",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  unitMarker: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    backgroundColor: "#E63946",
    borderWidth: 3,
    borderColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
  },
  unitMarkerHighlight: {
    width: 28,
    height: 28,
    backgroundColor: "#3DDC97",
  },
  unitMarkerLetter: {
    color: "#0D0D0D",
    fontSize: 11,
    fontWeight: "700",
  },
  unitMarkerLetterHighlight: {
    color: "#0D0D0D",
    fontSize: 13,
  },
});
