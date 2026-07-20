-- Profile photo uploads (public bucket, images only, up to 5MB).
-- Run once in the Supabase SQL editor.

alter table public.users
  add column if not exists avatar_url text null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path layout: {user_id}/avatar.{ext} — one photo per user, overwritten on
-- each re-upload (upsert: true from the client), so insert AND update both
-- need to be allowed for the owning user.
drop policy if exists "avatars upload own folder" on storage.objects;
create policy "avatars upload own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars update own folder" on storage.objects;
create policy "avatars update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars read public" on storage.objects;
create policy "avatars read public"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
