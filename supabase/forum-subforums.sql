-- SkillBridge forum subforums (skill-domain communities).
-- Run once in the Supabase SQL editor.

alter table public.forum_questions
  add column if not exists subforum_slug text not null default 'general';

create index if not exists forum_questions_subforum_slug_idx
  on public.forum_questions (subforum_slug);

-- Optional: refresh PostgREST schema cache after adding the column
-- notify pgrst, 'reload schema';
