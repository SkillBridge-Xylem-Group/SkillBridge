-- Persist icon accent color chosen in the Create Community wizard.
-- Run once in the Supabase SQL editor.

alter table public.forum_communities
  add column if not exists accent_color text not null default 'brand';

-- Allowed values: brand | emerald | violet | amber | rose | sky
alter table public.forum_communities
  drop constraint if exists forum_communities_accent_color_check;

alter table public.forum_communities
  add constraint forum_communities_accent_color_check
  check (accent_color in ('brand', 'emerald', 'violet', 'amber', 'rose', 'sky'));
