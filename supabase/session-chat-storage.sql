-- Session chat file uploads (Skill Swap), up to 20MB per file.
-- Run once in the Supabase SQL editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'session-chat',
  'session-chat',
  false,
  20971520,
  null
)
on conflict (id) do update
set file_size_limit = excluded.file_size_limit;

-- Path layout: {request_id}/{user_id}/{unique-filename}
drop policy if exists "session chat upload own folder" on storage.objects;
create policy "session chat upload own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'session-chat'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "session chat read authenticated" on storage.objects;
create policy "session chat read authenticated"
on storage.objects
for select
to authenticated
using (bucket_id = 'session-chat');
