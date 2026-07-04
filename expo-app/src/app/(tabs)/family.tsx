import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/card";
import { FamilyContacts } from "@/components/FamilyContacts";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/useLocation";
import { formatCoordinates } from "@/lib/emergencyNumbers";
import type { FamilyContact } from "@/types/emergency";

/**
 * Local-storage-backed family contacts. The Next.js app stores the same
 * shape; this is the React Native port.
 */
const STORAGE_KEY = "erl.family_contacts";

const SEED: FamilyContact[] = [
  { id: "1", name: "Mom", relation: "Mother", phone: "+919876543210" },
  { id: "2", name: "Dad", relation: "Father", phone: "+919876543211" },
  { id: "3", name: "Brother", relation: "Sibling", phone: "+919876543212" },
];

async function loadContacts(): Promise<FamilyContact[]> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as FamilyContact[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED;
  } catch {
    return SEED;
  }
}

async function saveContacts(contacts: FamilyContact[]) {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    /* ignore quota errors */
  }
}

function uid(): string {
  // RFC4122 v4 — works in Expo Go without crypto polyfill.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function FamilyScreen() {
  const { coordinates, displayName } = useLocation({ autoStart: true });
  const [contacts, setContacts] = useState<FamilyContact[]>(SEED);
  const [draft, setDraft] = useState({ name: "", relation: "", phone: "" });

  useEffect(() => {
    void loadContacts().then(setContacts);
  }, []);

  const addContact = async () => {
    if (!draft.name.trim() || !draft.phone.trim()) return;
    const next: FamilyContact = {
      id: uid(),
      name: draft.name.trim(),
      relation: draft.relation.trim() || "Contact",
      phone: draft.phone.trim(),
    };
    const updated = [next, ...contacts];
    setContacts(updated);
    await saveContacts(updated);
    setDraft({ name: "", relation: "", phone: "" });
  };

  const removeContact = async (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    await saveContacts(updated);
  };

  const locationLabel = displayName
    ? `${displayName} (${formatCoordinates(coordinates)})`
    : formatCoordinates(coordinates);

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
                Family & Contacts
              </Text>
              <Text className="text-sm text-muted">
                Notify or call in one tap. Location link auto-attached.
              </Text>
            </View>

            <Card className="p-4">
              <Text className="mb-3 font-display text-base font-semibold text-foreground">
                Add a contact
              </Text>
              <View className="gap-2">
                <TextInput
                  value={draft.name}
                  onChangeText={(t) => setDraft({ ...draft, name: t })}
                  placeholder="Name (e.g., Mom)"
                  placeholderTextColor="#8E8E93"
                  className="h-11 rounded-pill border border-border bg-background px-4 text-sm text-foreground"
                />
                <TextInput
                  value={draft.relation}
                  onChangeText={(t) => setDraft({ ...draft, relation: t })}
                  placeholder="Relation (e.g., Mother)"
                  placeholderTextColor="#8E8E93"
                  className="h-11 rounded-pill border border-border bg-background px-4 text-sm text-foreground"
                />
                <TextInput
                  value={draft.phone}
                  onChangeText={(t) => setDraft({ ...draft, phone: t })}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#8E8E93"
                  keyboardType="phone-pad"
                  className="h-11 rounded-pill border border-border bg-background px-4 text-sm text-foreground"
                />
              </View>
              <View className="mt-3">
                <Button
                  variant="green"
                  onPress={addContact}
                  title="Add contact"
                />
              </View>
            </Card>

            <FamilyContacts contacts={contacts} locationLabel={locationLabel} />

            {contacts.length > 0 && (
              <Card className="p-4">
                <Text className="mb-2 font-display text-base font-semibold text-foreground">
                  Manage
                </Text>
                <View className="gap-2">
                  {contacts.map((c) => (
                    <View
                      key={c.id}
                      className="flex-row items-center justify-between gap-2"
                    >
                      <Text
                        className="flex-1 text-sm text-foreground"
                        numberOfLines={1}
                      >
                        {c.name}{" "}
                        <Text className="text-muted">· {c.relation}</Text>
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => removeContact(c.id)}
                        className="rounded-pill border border-border px-3 py-1 active:opacity-80"
                      >
                        <Text className="text-xs text-emergency">Remove</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
