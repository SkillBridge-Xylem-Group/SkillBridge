-- Per-user soft-hide for session history (does not delete the row for the other party).
-- Run once in the Supabase SQL editor.

alter table public.session_requests
  add column if not exists requester_hidden boolean not null default false;

alter table public.session_requests
  add column if not exists receiver_hidden boolean not null default false;
