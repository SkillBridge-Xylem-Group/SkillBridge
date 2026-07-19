-- Reddit-style nested comments + bidirectional votes.
-- Run once in the Supabase SQL editor.

-- Parent reply (null = top-level comment)
alter table public.forum_answers
  add column if not exists parent_answer_id uuid null
  references public.forum_answers (answer_id) on delete cascade;

create index if not exists forum_answers_question_id_idx
  on public.forum_answers (question_id);

create index if not exists forum_answers_parent_answer_id_idx
  on public.forum_answers (parent_answer_id);

-- Vote direction: 1 = upvote, -1 = downvote (existing rows default to upvote)
alter table public.answer_votes
  add column if not exists value smallint not null default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'answer_votes_value_check'
  ) then
    alter table public.answer_votes
      add constraint answer_votes_value_check check (value in (-1, 1));
  end if;
end $$;
