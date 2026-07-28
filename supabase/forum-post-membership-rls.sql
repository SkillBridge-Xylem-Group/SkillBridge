-- Fixes: any authenticated user can post a question/comment into a
-- restricted or private community they never joined, simply by knowing
-- (or leaking) its slug/URL. The Next.js server actions already check
-- membership (see canUserParticipateInCommunity in lib/forumCommunities.ts),
-- but that check is bypassed by calling Supabase directly with the user's
-- own anon-key session — the database itself was never enforcing it.
--
-- Run this whole file once in the Supabase SQL Editor (Project -> SQL Editor).

-- 1. Helper: can this user post into this subforum slug?
--    - Slugs with no forum_communities row (legacy static subforums) stay
--      open to any authenticated user.
--    - visibility = 'public' (the default): open to any authenticated user,
--      matching the "Anyone can view, post, and comment" copy in the create-
--      community UI.
--    - visibility = 'restricted' / 'private': creator or an approved member
--      only — this is the tier the reported bug actually affects.
create or replace function public.can_post_to_subforum(p_slug text, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when not exists (select 1 from forum_communities where slug = p_slug) then true
      else exists (
        select 1
        from forum_communities c
        where c.slug = p_slug
          and (
            coalesce(c.visibility, 'public') = 'public'
            or c.created_by = p_user_id
            or exists (
              select 1 from forum_community_members m
              where m.community_id = c.id and m.user_id = p_user_id
            )
          )
      )
    end
$$;

revoke all on function public.can_post_to_subforum(text, uuid) from public;
grant execute on function public.can_post_to_subforum(text, uuid) to authenticated;

-- 2. Make sure RLS is actually on for both tables.
alter table public.forum_questions enable row level security;
alter table public.forum_answers enable row level security;

-- 3. Drop every existing INSERT policy on these two tables first.
--    Postgres OR's multiple permissive policies together for the same
--    command, so a stale/looser policy left in place would silently
--    defeat the tighter one added below.
do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'forum_questions' and cmd = 'INSERT'
  loop
    execute format('drop policy %I on public.forum_questions', pol.policyname);
  end loop;

  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'forum_answers' and cmd = 'INSERT'
  loop
    execute format('drop policy %I on public.forum_answers', pol.policyname);
  end loop;
end $$;

-- 4. Recreate INSERT policies that actually enforce membership.
create policy "forum_questions_insert_members_only"
on public.forum_questions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.can_post_to_subforum(subforum_slug, auth.uid())
);

create policy "forum_answers_insert_members_only"
on public.forum_answers
for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.can_post_to_subforum(
    (select subforum_slug from forum_questions where question_id = forum_answers.question_id),
    auth.uid()
  )
);

-- 5. Sanity check — list the INSERT policies now in place on both tables.
select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('forum_questions', 'forum_answers')
  and cmd = 'INSERT';
