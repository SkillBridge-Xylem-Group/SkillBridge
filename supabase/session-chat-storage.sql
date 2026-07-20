-- Session chat file uploads (Skill Swap), up to 20MB per file.
-- Run once in the Supabase SQL editor.
-- For existing projects, also run supabase/security-hardening.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'session-chat',
  'session-chat',
  false,
  20971520,
  array[
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
)
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path layout: {request_id}/{user_id}/{unique-filename}
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
drop policy if exists "session chat read participants" on storage.objects;
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
