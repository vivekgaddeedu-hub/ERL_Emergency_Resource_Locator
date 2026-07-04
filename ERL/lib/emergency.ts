import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchNearbyFacilities } from "@/lib/overpass";
import type { Coordinates, EmergencyType, EmergencyUnit } from "@/types/emergency";

export async function fetchEmergencyUnits(
  coord: Coordinates,
  type: EmergencyType,
  radiusMeters = 8000,
  limit = 10
): Promise<EmergencyUnit[]> {
  if (!isSupabaseConfigured()) {
    return fetchNearbyFacilities(coord, type, radiusMeters, limit);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return fetchNearbyFacilities(coord, type, radiusMeters, limit);
  }

  const { data, error } = await supabase
    .from("emergency_units")
    .select("id, name, type, latitude, longitude")
    .eq("type", type)
    .limit(limit);

  if (error || !data) {
    return fetchNearbyFacilities(coord, type, radiusMeters, limit);
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as EmergencyType,
    latitude: row.latitude,
    longitude: row.longitude,
  }));
}

export function subscribeEmergencyUnits(onChange: () => void) {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const supabase = getSupabase();
  if (!supabase) {
    return () => {};
  }

  const channel = supabase
    .channel("public:emergency_units")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "emergency_units" },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
