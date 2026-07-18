-- SkillBridge user settings columns (gender, location, display language).
-- Run once in the Supabase SQL editor if these columns are missing.

alter table public.users
  add column if not exists gender text,
  add column if not exists location_preference text,
  add column if not exists language text;

-- Optional: refresh PostgREST schema cache after adding columns
-- notify pgrst, 'reload schema';
