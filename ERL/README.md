# 🚨 Emergency Resource Locator (ERL)
### *Seconds Save Lives*

> **We didn't build another emergency app. We built the emergency screen that should already exist.**

ERL takes the screen you already trust and gives it a brain: real-time responder locations, real ETA-based prioritization (not just distance), instant access to family, the correct emergency number anywhere in the world, and a voice-first path for when tapping isn't an option.

---

## 🆘 The Problem

Every phone already has an Emergency screen. It's dark, urgent, one swipe away — and it still fails you when it matters most. It shows a generic number and nothing else. It doesn't know:

- Where the nearest ambulance is
- Whether that ambulance can actually get there *fast*
- Who to call in your family the moment things go wrong

## ✨ The Solution

ERL is a pixel-faithful Android-emergency-screen clone that:

- **Detects your location** with the native Geolocation API
- **Reverse-geocodes** your country via Nominatim → resolves the right emergency number
- **Pulls nearby responders** from OpenStreetMap via the Overpass API
- **Computes driving ETAs** with OSRM — not raw distance
- **Refreshes nearby responders live** with browser watchPosition and Supabase realtime updates when configured
- **Sorts by fastest arrival** — the headline differentiator
- **Notifies family** in one tap with a location-attached WhatsApp link
- **Listens for your voice** with the Web Speech API (with mandatory visual confirmation)

---

## 🚀 Live Demo

`https://erl.your-domain.vercel.app` _(replace after first deploy)_

---

## 📦 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | **Next.js 15 + TypeScript** | Fast, typed, no runtime surprises during demo |
| UI | **Tailwind CSS + shadcn-style components** | Polished, pixel-faithful look without hand-rolling CSS |
| Icons | **Lucide** | Clean, consistent, tree-shaken |
| Maps | **Leaflet + OpenStreetMap** | Free, no API key |
| Routing | **OSRM** | Free, no API key, real driving ETAs |
| Places | **Overpass API** | Free, OSM-backed |
| Geocoding | **Nominatim** | Free, OSM-backed |
| Voice | **Web Speech API** | Native, zero-cost |
| Data | **Supabase / localStorage** | Backend-optional; works offline-of-cloud; realtime-enabled when Supabase is configured |

> **Zero paid APIs.** The entire stack is free and open-source. There is no quota that will run out during your demo.

---

## 🏗️ Architecture

```
User
  ↓
Emergency Screen
  ↓
GPS (Browser Geolocation)
  ↓
Reverse Geocode (Nominatim) → Correct Emergency Number
  ↓
Nearby Resources (Overpass API)
  ↓
OSRM ETA Calculation
  ↓
Sorted Results (fastest arrival first)
  ↓
Call / Notify (tel: deep link + WhatsApp share)
  ↓
Voice Assistant (parallel input path, Web Speech API)
```

---

## ✨ Features

### ✅ Must-Have
- Native-look emergency screen (pixel-matched dark UI)
- SOS button (one tap)
- Location detection (Browser Geolocation)
- Location-aware emergency number (Nominatim reverse geocode + static JSON)
- Map with nearby resources (Leaflet + Overpass)
- ETA-based sorting (OSRM)
- Live location tracking + realtime responder refresh when available
- Call button (`tel:` deep link)

### 🟡 Should-Have
- Family Contacts (call + notify with location link)
- Voice Assistant (Web Speech API, confirmation-gated)
- Turn-by-turn directions deep link (Google Maps)

### 🌟 Nice-to-Have
- Live traffic overlay
- Twilio-powered real SMS/calls
- AI assistant layer for natural-language triage

---

## 🖥️ Screens

1. **Emergency** (`/`) — Profile, current location, local emergency number, big SOS button, map preview
2. **Nearby Resources** (`/resources`) — Tabbed hospital / police / fire list, sorted by ETA, with map and call/directions actions
3. **Family** (`/family`) — Contact cards, one-tap call or WhatsApp notify with location link
4. **Voice** (`/voice`) — Mic control, "Call ambulance / police / fire / notify family" phrases, visual confirmation before execution

---

## 📦 Installation

```bash
git clone <your-repo-url>
cd ERL
npm install
cp .env.example .env.local   # optional: only for Supabase
npm run dev
```

## 📱 Run the Expo app

To open the native app in Expo Go:

```bash
cd expo-app
npm install
npx expo start
```

Then scan the QR code with Expo Go on your phone. The `expo-app` uses `react-native-maps` with `UrlTile` and should work in Expo Go without requiring an API key.

Open <http://localhost:3000>.

### Build & test

```bash
npm run lint
npm run type-check
npm run test         # unit tests
npm run test:e2e     # Playwright e2e (requires `npx playwright install`)
npm run verify       # runs lint + typecheck + tests + build
```

### Deploy to Vercel

```bash
npx vercel
```

The included `vercel.json` sets security headers. No environment variables are required.

---

## 🗃️ Database (optional)

The app works without any backend. To enable Supabase:

1. Create a project at <https://supabase.com>
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Run `supabase/seed.sql` to seed real Bengaluru emergency units
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
5. Re-deploy

Family contacts are stored in `localStorage` for the demo, with a Supabase migration path.

---

## 🧪 Testing

| Layer | Tool | Coverage |
|---|---|---|
| Unit (logic) | **Vitest** | ETA ranking, geocoding, OSRM client, Overpass parser, hooks |
| Unit (UI) | **Vitest + Testing Library** | Components render with correct content & a11y |
| E2E (demo flow) | **Playwright** | Full 3-minute judge demo on Pixel 5 & iPhone 13 |

```bash
npm run test       # 30+ unit tests
npm run test:e2e   # e2e demo flow
npm run test:cov   # coverage report in coverage/
```

---

## 🎬 3-Minute Judge Demo Script

1. **Open the app →** "Looks exactly like the Android Emergency screen."
2. **Tap SOS →** current location resolves → nearest ambulance appears → ETA calculates → correct local number displays.
3. **Open Family →** tap **Notify** on Mom → location link sent.
4. **Trigger Voice →** say *"Call ambulance"* → confirm → call initiated.
5. **Close** with the line above.

---

## 🗂️ Folder Structure

```
ERL/
├── app/              Next.js 15 App Router pages
│   ├── page.tsx              Emergency Screen
│   ├── resources/page.tsx    Nearby resources
│   ├── family/page.tsx       Family contacts
│   ├── voice/page.tsx        Voice assistant
│   ├── layout.tsx
│   └── globals.css
├── components/       UI components
│   ├── EmergencyCard.tsx · ETAList.tsx · EmergencyNumber.tsx
│   ├── Map.tsx · SOSButton.tsx · FamilyContacts.tsx
│   ├── VoiceAssistant.tsx · Navbar.tsx
│   └── ui/                  shadcn-style primitives
├── lib/              API clients + utilities
│   ├── geolocation.ts · overpass.ts · osrm.ts
│   ├── emergencyNumbers.ts · supabase.ts · utils.ts
├── hooks/            useLocation · useVoice
├── types/            shared TS types
├── utils/            calculateETA (ranking, formatting, links)
├── tests/            Vitest unit + Playwright e2e
├── supabase/         schema.sql · seed.sql · emergency_numbers.json
├── .github/          CI workflow
├── vercel.json       deploy config
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

---

## 🛣️ Future Scope

- **Twilio integration** for real SMS/call dispatch
- **Live traffic overlay** on the map
- **AI triage** layer (severity classification from voice transcript)
- **First-responder app** that receives SOS and confirms arrival
- **Offline mode** with cached tiles + last-known location

---

## 👥 Team

| Role | Responsibility |
|---|---|
| Frontend Lead | Next.js/TypeScript scaffolding, pixel-matched UI, deploy pipeline |
| UI/UX & Design | Tailwind styling, Family + Voice screens, visual polish |
| Backend/Data | Supabase schema, Overpass integration, contact data model |
| Integration & Intelligence | Geolocation, Leaflet, OSRM, Web Speech API |

---

## 📄 License

MIT — built for the hackathon, free for the world.
