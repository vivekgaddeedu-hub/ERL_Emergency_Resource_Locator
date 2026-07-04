# 🚨 ERL — Expo App (for Expo Go)

This is the **React Native + Expo** port of the Emergency Resource Locator. It mirrors the Next.js app's logic (Overpass, OSRM, Nominatim, voice) and runs in **Expo Go** without a native build.

> The original Next.js app lives in the parent directory and remains the canonical web demo. Both share the same data flow; only the rendering layer differs.

---

## ✅ Features (fully working)

| Screen | What it does |
|---|---|
| **Emergency** (`/`) | Live GPS, country-aware emergency number, big SOS button, OSM map, fastest-responder card. Auto-refreshes every 30s. |
| **Nearby** (`/resources`) | Tabbed Hospital / Police / Fire list sorted by **OSRM ETA**, with directions and one-tap call. |
| **Family** (`/family`) | Add / remove contacts; one-tap `tel:` call or WhatsApp notify with location link. Persists via `AsyncStorage`. |
| **Voice** (`/voice`) | `expo-speech-recognition` mic control with **mandatory visual confirmation** before any call. |

**Realtime behavior:**
- `useLocation({ realtime: true })` watches position via `expo-location` and re-renders as you move.
- Nearby resources re-fetch every **30 seconds** plus on every tab switch — the ETA list is never stale while the app is open.
- Map markers update in place as units/positions change.

**Offline-of-cloud:** the app falls back to a Bengaluru default location if permission is denied, and ranks units by haversine if OSRM is unreachable. The demo never goes blank.

---

## 🚀 Run it in Expo Go (3 steps)

### 1. Install dependencies

```bash
cd expo-app
npm install
```

> Requires Node 18+ and a recent npm. We pin **Expo SDK 52** + **React Native 0.76**.

### 2. Start the dev server

```bash
npx expo start
```

You'll see a QR code in the terminal.

### 3. Open in Expo Go

- **iOS:** open the Camera app and scan the QR code, or open the link from the Expo Go app.
- **Android:** open Expo Go → tap "Scan QR code" → point at the terminal.

The app will download and launch with all four screens, live location, and a working voice button (iOS native; Android requires a dev build for `expo-speech-recognition` — see the note below).

> **Tip — same Wi-Fi required.** Your phone and laptop must be on the same network. If you're on a restricted network, run `npx expo start --tunnel` (uses ngrok under the hood).

---

## 📱 Platform notes

- **iOS** (Expo Go): location + voice work out of the box.
- **Android** (Expo Go): location works. Voice requires a development build (`eas build --profile development`) because `expo-speech-recognition` is a native module not bundled in Expo Go. Until then, the Voice screen shows a clear "Voice not supported on this device" badge.
- **Web** (Expo Go → web): the app also runs in a browser via `npx expo start --web` for quick UI testing. Maps degrade gracefully.

---

## 📦 Tech stack

| Layer | Library |
|---|---|
| Framework | **Expo SDK 52** + **expo-router 4** |
| Maps | **react-native-maps** with OpenStreetMap `UrlTile` (no API key) |
| Location | **expo-location** (foreground + watch) |
| Voice | **expo-speech-recognition** with graceful fallback |
| Styling | **NativeWind 4** (Tailwind for RN) |
| Storage | **@react-native-async-storage/async-storage** for family contacts |
| Data | **Overpass** (places), **OSRM** (ETA), **Nominatim / device geocoder** (country) |

> **Zero paid APIs.** The same free stack as the Next.js app.

---

## 🗂️ Folder structure

```
expo-app/
├── app.json                      # Expo config
├── package.json
├── tailwind.config.js
├── metro.config.js
├── babel.config.js
├── global.css
└── src/
    ├── app/                      # expo-router
    │   ├── _layout.tsx           #   root: providers, status bar
    │   └── (tabs)/
    │       ├── _layout.tsx       #   tab bar
    │       ├── index.tsx         #   Emergency screen
    │       ├── resources.tsx     #   Nearby screen
    │       ├── family.tsx        #   Family screen
    │       └── voice.tsx         #   Voice screen
    ├── components/               # Reusable UI
    │   ├── ui/                   #   card, button, badge
    │   ├── SOSButton.tsx
    │   ├── EmergencyNumber.tsx
    │   ├── EmergencyCard.tsx
    │   ├── ETAList.tsx
    │   ├── Map.tsx
    │   ├── FamilyContacts.tsx
    │   └── VoiceAssistant.tsx
    ├── hooks/
    │   ├── useLocation.ts        #   expo-location + watch
    │   └── useVoice.ts           #   expo-speech-recognition
    ├── lib/
    │   ├── overpass.ts
    │   ├── osrm.ts
    │   ├── geolocation.ts
    │   ├── emergencyNumbers.ts
    │   └── utils.ts
    ├── types/emergency.ts
    └── utils/calculateETA.ts
```

---

## 🧪 Verify it builds

```bash
cd expo-app
npx expo-doctor      # Checks config, plugins, version alignment
npx tsc --noEmit     # TypeScript (paths: @/* → src/*)
```

---

## 🛣️ Optional: build a standalone app

Expo Go is great for demos, but for App Store / Play Store distribution you need a dev client:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p ios --profile preview
eas build -p android --profile preview
```

The same `src/` codebase builds a real `.ipa` / `.apk` — no changes required.

---

## 📄 License

MIT — same as the parent project.
