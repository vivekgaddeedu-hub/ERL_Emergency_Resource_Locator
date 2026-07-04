-- =========================================================
-- Emergency Resource Locator (ERL) — Supabase / PostgreSQL
-- =========================================================
-- Run in the SQL editor of your Supabase project, or via
--   supabase db reset
-- Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

-- ---------- family_contacts ----------
create table if not exists public.family_contacts (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  relation  text not null,
  phone     text not null check (phone ~ '^\+?[1-9][0-9]{6,14}$'),
  photo     text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists family_contacts_name_idx on public.family_contacts (name);

-- ---------- emergency_units ----------
create table if not exists public.emergency_units (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  type      text not null check (type in ('hospital', 'police', 'fire')),
  latitude  double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  created_at timestamptz not null default now()
);

create index if not exists emergency_units_type_idx on public.emergency_units (type);
create index if not exists emergency_units_geo_idx
  on public.emergency_units using gist (ll_to_earth(latitude, longitude));

-- ---------- emergency_sessions (optional audit log) ----------
create table if not exists public.emergency_sessions (
  id        uuid primary key default gen_random_uuid(),
  unit_id   uuid references public.emergency_units (id) on delete set null,
  latitude  double precision not null,
  longitude double precision not null,
  type      text not null check (type in ('sos', 'call', 'notify', 'voice')),
  created_at timestamptz not null default now()
);

create index if not exists emergency_sessions_created_at_idx
  on public.emergency_sessions (created_at desc);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_family_contacts_updated_at on public.family_contacts;
create trigger trg_family_contacts_updated_at
  before update on public.family_contacts
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------
alter table public.family_contacts enable row level security;
alter table public.emergency_units enable row level security;
alter table public.emergency_sessions enable row level security;

-- Public read access — the app reads these from the client.
drop policy if exists "public read family_contacts" on public.family_contacts;
create policy "public read family_contacts"
  on public.family_contacts for select using (true);

drop policy if exists "public read emergency_units" on public.emergency_units;
create policy "public read emergency_units"
  on public.emergency_units for select using (true);

drop policy if exists "public read emergency_sessions" on public.emergency_sessions;
create policy "public read emergency_sessions"
  on public.emergency_sessions for select using (true);

-- Public write access is disabled by default. For the demo, uncomment the
-- following if you want to let the app write directly. In production, gate
-- behind authenticated users + Supabase Auth.
-- drop policy if exists "public write family_contacts" on public.family_contacts;
-- create policy "public write family_contacts"
--   on public.family_contacts for insert with check (true);
