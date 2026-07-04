import { Tabs } from "expo-router";
import { Heart, Users, Mic, Map as MapIcon } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";

export default function TabsLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#F1FAEE",
          tabBarInactiveTintColor: "#8E8E93",
          tabBarStyle: {
            backgroundColor: "#0D0D0D",
            borderTopColor: "#1F1F1F",
            borderTopWidth: 1,
            height: 70,
            paddingTop: 8,
            paddingBottom: 16,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Emergency",
            tabBarIcon: ({ color }) => <Heart size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="resources"
          options={{
            title: "Nearby",
            tabBarIcon: ({ color }) => <MapIcon size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="family"
          options={{
            title: "Family",
            tabBarIcon: ({ color }) => <Users size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="voice"
          options={{
            title: "Voice",
            tabBarIcon: ({ color }) => <Mic size={22} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
