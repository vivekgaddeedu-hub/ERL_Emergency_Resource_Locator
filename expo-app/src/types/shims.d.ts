// Ambient module declarations for native-only packages used in the Expo app.
declare module "react-native" {
  import * as RN from "react-native";
  export = RN;
}

declare module "react-native-safe-area-context";
declare module "expo-status-bar";
declare module "expo-router";
declare module "lucide-react-native";
declare module "@react-native-async-storage/async-storage";
declare module "react-native-maps";

// Allow importing CSS in the expo web/metro context
declare module "*.css";

export {}; 
