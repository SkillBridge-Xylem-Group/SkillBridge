-- SkillBridge user-creatable forum communities (Reddit-style).
-- Run once in the Supabase SQL editor.
-- Also ensure forum_questions.subforum_slug exists (see forum-subforums.sql).

create table if not exists public.forum_communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  category text not null default 'General',
  image_url text null,
  created_by uuid references public.users (id) on delete set null,
  is_official boolean not null default false,
  created_at timestamptz not null default now(),
  constraint forum_communities_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$')
);

create index if not exists forum_communities_category_idx
  on public.forum_communities (category);

create index if not exists forum_communities_created_at_idx
  on public.forum_communities (created_at desc);

create table if not exists public.forum_community_members (
  community_id uuid not null references public.forum_communities (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create index if not exists forum_community_members_user_idx
  on public.forum_community_members (user_id);

alter table public.forum_communities enable row level security;
alter table public.forum_community_members enable row level security;

drop policy if exists "forum communities read all" on public.forum_communities;
create policy "forum communities read all"
on public.forum_communities for select to authenticated
using (true);

drop policy if exists "forum communities insert own" on public.forum_communities;
create policy "forum communities insert own"
on public.forum_communities for insert to authenticated
with check (created_by = auth.uid());

drop policy if exists "forum communities update creator" on public.forum_communities;
create policy "forum communities update creator"
on public.forum_communities for update to authenticated
using (created_by = auth.uid() or is_official = true)
with check (created_by = auth.uid() or is_official = true);

drop policy if exists "forum members read all" on public.forum_community_members;
create policy "forum members read all"
on public.forum_community_members for select to authenticated
using (true);

drop policy if exists "forum members insert self" on public.forum_community_members;
create policy "forum members insert self"
on public.forum_community_members for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "forum members delete self" on public.forum_community_members;
create policy "forum members delete self"
on public.forum_community_members for delete to authenticated
using (user_id = auth.uid());

-- Seed a small set of official communities (product-relevant only).
-- Specialty topics should be created by users.
insert into public.forum_communities (slug, title, description, category, image_url, is_official)
values
  (
    'general',
    'General',
    'Everyday discussion about SkillBridge, learning, and anything that doesn’t need its own community yet',
    'General',
    null,
    true
  ),
  (
    'skill-swaps',
    'Skill Swaps',
    'Find swap partners, share session tips, and talk through what worked (or didn’t)',
    'General',
    null,
    true
  ),
  (
    'learning-help',
    'Learning Help',
    'Ask questions, unblock yourself, and help others get unstuck',
    'Education',
    null,
    true
  )
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_official = true;

-- Remove the old bulk skill-domain shells (posts remapped to general first).
update public.forum_questions
set subforum_slug = 'general'
where subforum_slug in (
  'full-stack-dev', 'ui-ux-design', 'product-strategy', 'digital-marketing',
  'data-science', 'mobile-development', 'copywriting', 'public-speaking',
  'photography', 'finance-investing', 'music-production', 'language-learning',
  'devops-cloud', 'video-editing', 'career-coaching', 'cybersecurity'
);

delete from public.forum_communities
where is_official = true
  and slug not in ('general', 'skill-swaps', 'learning-help')
  and created_by is null;

alter table public.forum_communities
  add column if not exists visibility text not null default 'public';

-- visibility: public | restricted | private

alter table public.forum_communities
  add column if not exists accent_color text not null default 'brand';
