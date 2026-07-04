# Architecture Decision Records (ADRs)

Lightweight, project-local ADRs capturing the why behind the major choices in
ERL. Each is short, dated, and lives in source control.

---

## ADR-001 — Use OSRM for driving ETAs, not haversine distance
**Date:** 2026-07-04 · **Status:** Accepted

**Context.** The headline differentiator of ERL is "fastest responder, not
the closest." Haversine gives a straight-line distance; an out-of-the-way
freeway exit can make a farther unit arrive first. The PRD names ETA-based
prioritization as the most technically credible differentiator.

**Decision.** Use the public OSRM demo server (`router.project-osrm.org`) for
all ETA lookups. Fall back to a haversine ranking at 40 km/h average speed
when OSRM is unreachable or rate-limited, so the demo never hangs.

**Consequences.** Adds a network dependency on a free public server. To stay
production-viable, host our own OSRM instance or pay a managed provider
when traffic grows. Unit tests cover both the happy path and the fallback.

---

## ADR-002 — Static JSON for emergency numbers, not a CMS
**Date:** 2026-07-04 · **Status:** Accepted

**Context.** Emergency numbers change rarely. Maintaining a CMS for ~30
values is overkill for a hackathon and a hot path during the demo.

**Decision.** Hard-code the country → number map in `lib/emergencyNumbers.ts`
with a loose match for partial country names. Resolve by reverse geocoding
with Nominatim at SOS time.

**Consequences.** Adding a country requires a code change and deploy, but
this is acceptable given how rarely these numbers change.

---

## ADR-003 — Optional Supabase, localStorage fallback
**Date:** 2026-07-04 · **Status:** Accepted

**Context.** Supabase brings a real DB and auth, but it adds a setup step
that can break a live demo if the judge runs the app cold.

**Decision.** Family contacts default to `localStorage` (with a seed list of
three contacts). The Supabase client is only created if env vars are set,
and the schema in `supabase/schema.sql` is provided for production.

**Consequences.** Demo works without any backend. Production migration path
is a one-line import swap.

---

## ADR-004 — Confirmation-gated voice commands
**Date:** 2026-07-04 · **Status:** Accepted · **Safety-critical**

**Context.** Voice-driven dialing is a safety-critical action. False-positive
triggers could call the wrong service in a real emergency.

**Decision.** Every recognized voice command produces a visual confirmation
card with **Yes / Cancel** buttons. Nothing dials blind.

**Consequences.** Adds one tap. This is the only correct tradeoff.

---

## ADR-005 — Free public APIs over paid managed services
**Date:** 2026-07-04 · **Status:** Accepted

**Context.** A hackathon demo cannot tolerate a rate-limit wall, a billing
page, or a regional outage.

**Decision.** All four data services (Nominatim, Overpass, OSRM, OSM tiles)
are free and public. We add graceful degradation (haversine fallback, empty
list on 429, default location on permission denied) so the app still
ships a coherent experience when any single service is slow.

**Consequences.** For production traffic, we will need to host our own
Overpass / OSRM or move to a paid tier. This is documented in the
`README.md` Future Scope section.
