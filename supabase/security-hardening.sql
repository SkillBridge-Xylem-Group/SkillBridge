-- SkillBridge security hardening (RLS + helpers).
-- Run once in the Supabase SQL editor AFTER deploying app changes that use admin client / RPCs.

-- ---------------------------------------------------------------------------
-- 1) Notifications: stop client-side inserts to arbitrary user_id
-- ---------------------------------------------------------------------------
drop policy if exists "notifications insert authenticated" on public.notifications;

-- Authenticated users may only insert a notification for themselves (unused by app;
-- server uses service role). Keeps accidental client inserts from targeting others.
create policy "notifications insert own only"
on public.notifications
for insert
to authenticated
with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2) Forum communities: only creator may update (no official bypass)
-- ---------------------------------------------------------------------------
drop policy if exists "forum communities update creator" on public.forum_communities;
create policy "forum communities update creator"
on public.forum_communities
for update
to authenticated
using (created_by = auth.uid() and is_official = false)
with check (created_by = auth.uid() and is_official = false);

-- ---------------------------------------------------------------------------
-- 3) Session-chat storage: participant-only read/upload + MIME allowlist
-- ---------------------------------------------------------------------------
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'video/webm'
]
where id = 'session-chat';

drop policy if exists "session chat upload own folder" on storage.objects;
create policy "session chat upload own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'session-chat'
  and (storage.foldername(name))[2] = auth.uid()::text
  and exists (
    select 1
    from public.session_requests sr
    where sr.request_id::text = (storage.foldername(name))[1]
      and (sr.requester_id = auth.uid() or sr.receiver_id = auth.uid())
      and sr.status in ('accepted', 'rescheduled', 'completed')
  )
);

drop policy if exists "session chat read authenticated" on storage.objects;
create policy "session chat read participants"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'session-chat'
  and exists (
    select 1
    from public.session_requests sr
    where sr.request_id::text = (storage.foldername(name))[1]
      and (sr.requester_id = auth.uid() or sr.receiver_id = auth.uid())
  )
);

-- ---------------------------------------------------------------------------
-- 4) Users: own-row updates only for non-sensitive profile fields
--    (XP / trust_score / role / is_suspended must go through service role)
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;

drop policy if exists "users select authenticated" on public.users;
create policy "users select authenticated"
on public.users
for select
to authenticated
using (true);

drop policy if exists "users update own profile" on public.users;
create policy "users update own profile"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- 5) Durable rate-limit table (service role only)
-- ---------------------------------------------------------------------------
create table if not exists public.auth_rate_limits (
  bucket text not null,
  rate_key text not null,
  window_started_at timestamptz not null,
  hit_count int not null default 0,
  primary key (bucket, rate_key)
);

alter table public.auth_rate_limits enable row level security;

-- ---------------------------------------------------------------------------
-- 6) Prevent clients from self-awarding XP / flipping suspension / role
-- ---------------------------------------------------------------------------
create or replace function public.protect_users_sensitive_columns()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;
  -- Clients may update profile fields; never XP / trust / role / suspension.
  new.experience_points := old.experience_points;
  new.level := old.level;
  new.trust_score := old.trust_score;
  new.role := old.role;
  new.is_suspended := old.is_suspended;
  new.suspended_reason := old.suspended_reason;
  return new;
end;
$$;

drop trigger if exists protect_users_sensitive on public.users;
create trigger protect_users_sensitive
before update on public.users
for each row
execute function public.protect_users_sensitive_columns();
