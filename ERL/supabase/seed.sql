-- Seed data for the `emergency_units` table. Used by `supabase/seed.sql`.
-- These are real Bengaluru hospitals / police / fire stations for the demo.

insert into public.emergency_units (name, type, latitude, longitude) values
  ('Manipal Hospital',          'hospital', 12.9580, 77.6480),
  ('Fortis Hospital',           'hospital', 12.8910, 77.6014),
  ('Victoria Hospital',         'hospital', 12.9606, 77.5730),
  ('Cloudnine Hospital',        'hospital', 12.9279, 77.6271),
  ('St. John''s Medical College', 'hospital', 12.9279, 77.6202),
  ('M.S. Ramaiah Hospital',     'hospital', 13.0298, 77.5651),
  ('Bowring Hospital',          'hospital', 12.9847, 77.6055),
  ('Cubbon Park Police',        'police',   12.9763, 77.5929),
  ('Ashok Nagar Police',        'police',   12.9719, 77.6065),
  ('High Grounds Police',       'police',   12.9890, 77.5840),
  ('Majestic Police Outpost',   'police',   12.9766, 77.5712),
  ('KSAS Fire Station',         'fire',     12.9621, 77.5955),
  ('Whitefield Fire Station',   'fire',     12.9698, 77.7500),
  ('HSR Fire Station',          'fire',     12.9116, 77.6473)
on conflict do nothing;
