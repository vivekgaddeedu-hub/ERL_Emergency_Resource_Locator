# Security Policy

## Reporting a Vulnerability

If you discover a security issue in ERL, please email the maintainers
directly or open a private advisory on GitHub. Do **not** file a public issue
for vulnerabilities that could be exploited before a fix is shipped.

We aim to acknowledge reports within 48 hours and ship a fix within 14 days
for critical issues.

## Scope

In scope:
- XSS / injection in any of the user-input surfaces (family contact names)
- Geolocation / microphone permission handling
- `tel:` and `https://wa.me/` deep link handling
- Supabase RLS policies and anon key exposure

Out of scope:
- The free public APIs we depend on (Nominatim, Overpass, OSRM)
- Vercel's infrastructure
