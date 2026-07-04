// Repo-wide ambient declarations to silence native-only modules during Next build
declare module "react-native" {
  const RN: any;
  export = RN;
}

declare module "react-native-safe-area-context" { const x: any; export = x; }
declare module "@react-native-async-storage/async-storage" { const x: any; export = x; }
declare module "expo-status-bar" { const x: any; export = x; }
declare module "expo-router" { const x: any; export = x; }
declare module "lucide-react-native" { const x: any; export = x; }
declare module "react-native-maps" { const x: any; export = x; }

export {};
