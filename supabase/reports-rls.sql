-- Reports RLS: users can submit; admins can read/update.
-- Run once in Supabase SQL editor if the reports table already exists without policies.

alter table public.reports enable row level security;

drop policy if exists "reports insert own" on public.reports;
create policy "reports insert own"
on public.reports
for insert
to authenticated
with check (reporter_id = auth.uid());

drop policy if exists "reports select admin" on public.reports;
create policy "reports select admin"
on public.reports
for select
to authenticated
using (
  exists (select 1 from public.admins where user_id = auth.uid())
);

drop policy if exists "reports update admin" on public.reports;
create policy "reports update admin"
on public.reports
for update
to authenticated
using (
  exists (select 1 from public.admins where user_id = auth.uid())
)
with check (
  exists (select 1 from public.admins where user_id = auth.uid())
);
