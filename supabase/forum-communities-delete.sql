-- Allow community creators to delete their own (non-official) communities.
-- Run once in the Supabase SQL editor.

drop policy if exists "forum communities delete creator" on public.forum_communities;
create policy "forum communities delete creator"
on public.forum_communities for delete to authenticated
using (created_by = auth.uid() and is_official = false);
