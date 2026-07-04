# 📑 ERL Pitch Deck (10 slides)

Use this outline as a 1-pager for the slide deck. Each slide has a single
hero idea + the supporting visuals listed.

---

### Slide 1 — Title
**Emergency Resource Locator — Seconds Save Lives**
*We didn't build another emergency app. We built the emergency screen that should already exist.*

---

### Slide 2 — Problem
- Every phone has an Emergency screen. It only gives a number.
- Doesn't know: nearest ambulance, fastest arrival, or who to call in your family.
- (Hero image: native Android Emergency screen, blurred, with annotation "missing the brain".)

---

### Slide 3 — Existing Gap
- 3 swipes to call. 0 swipes to know if help can reach you in time.
- Generic number regardless of country.
- No family loop. No voice path for shaking hands.

---

### Slide 4 — Our Solution
- 4 screens: Emergency · Nearby · Family · Voice.
- Sort by **ETA**, not distance. Country-aware number. One-tap family notify. Voice confirmation.

---

### Slide 5 — Architecture
```
User → Geolocation → Nominatim → Number
                  ↘ Overpass → OSRM → Sorted ETAs
                                       ↓
                              Call / Notify / Voice
```
- 100% free APIs. No paid keys. No quota cliffs.

---

### Slide 6 — Live Demo
- (Embedded Loom / live app link.)
- 3-minute script in §13 of the PRD.

---

### Slide 7 — Tech Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js 15 + TypeScript |
| UI | Tailwind + shadcn/ui |
| Maps | Leaflet + OSM |
| Routing | OSRM |
| Places | Overpass |
| Geocoding | Nominatim |
| Voice | Web Speech API |
| Data | Supabase |

---

### Slide 8 — Impact
- **5 seconds** from SOS tap to sorted ETA results.
- **Zero paid APIs** — production-viable from day one.
- **Voice-first** — works when hands can't.
- **Family loop** — auto-notify, no one left in the dark.

---

### Slide 9 — Future Work
- Twilio dispatch (real SMS/calls).
- Live traffic overlay.
- AI triage from voice transcript.
- First-responder app that confirms arrival.

---

### Slide 10 — Thank You
*Fastest responder, not the closest. Family notified automatically. The right number, anywhere in the world. Voice-activated when hands can't be used. All on a zero-cost, production-viable stack.*
