-- Make unread notification / message badges update in real time.
-- Run once in the Supabase SQL editor.
--
-- Supabase Realtime delivers `postgres_changes` only for rows the subscriber is
-- allowed to SELECT under RLS, so we need both:
--   1) the table published to the `supabase_realtime` publication, and
--   2) RLS policies that let a user read (and update) their own notifications.
--
-- The INSERT policy intentionally allows any authenticated user to create a
-- notification, because notifications are written for the *recipient* as a side
-- effect (e.g. sending a message inserts a row for the partner).

alter table public.notifications enable row level security;

drop policy if exists "notifications select own" on public.notifications;
create policy "notifications select own"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "notifications insert authenticated" on public.notifications;
create policy "notifications insert authenticated"
on public.notifications
for insert
to authenticated
with check (auth.uid() is not null);

-- Add the table to the realtime publication (guarded so re-running is safe).
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- Ensure full row data is available on updates (so is_read changes broadcast).
alter table public.notifications replica identity full;
