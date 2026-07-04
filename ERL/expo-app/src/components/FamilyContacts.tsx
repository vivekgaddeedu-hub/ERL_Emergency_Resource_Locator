"use client";

import { Linking, Pressable, Text, View } from "react-native";
import { Phone, MapPin } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FamilyContact } from "@/types/emergency";
import { notifyLink, telLink } from "@/utils/calculateETA";

type FamilyContactsProps = {
  contacts: FamilyContact[];
  locationLabel: string;
};

export function FamilyContacts({ contacts, locationLabel }: FamilyContactsProps) {
  if (contacts.length === 0) {
    return (
      <Card className="p-6">
        <Text className="text-center text-sm text-muted">
          No emergency contacts yet. Add Mom, Dad, or close family to get started.
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      {contacts.map((contact) => (
        <Card key={contact.id} className="flex-row items-center gap-4 p-4">
          <View className="h-12 w-12 items-center justify-center rounded-pill bg-navy">
            <Text className="font-display text-lg font-bold text-foreground">
              {contact.name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text
                className="font-display text-base font-semibold text-foreground"
                numberOfLines={1}
              >
                {contact.name}
              </Text>
              <Badge variant="default">{contact.relation}</Badge>
            </View>
            <Text className="text-xs text-muted" numberOfLines={1}>
              {contact.phone}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              accessibilityLabel={`Call ${contact.name}`}
              onPress={() => Linking.openURL(telLink(contact.phone))}
              className="h-12 w-12 items-center justify-center rounded-pill bg-emergency active:opacity-80"
            >
              <Phone size={20} color="white" />
            </Pressable>
            <Pressable
              accessibilityLabel={`Notify ${contact.name}`}
              onPress={() => Linking.openURL(notifyLink(contact, locationLabel))}
              className="h-12 w-12 items-center justify-center rounded-pill bg-green active:opacity-80"
            >
              <MapPin size={20} color="#0D0D0D" />
            </Pressable>
          </View>
        </Card>
      ))}
    </View>
  );
}
