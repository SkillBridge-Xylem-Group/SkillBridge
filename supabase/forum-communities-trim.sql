-- One-shot cleanup if you already seeded the 17 skill-domain communities.
-- Safe to re-run. Prefer re-running the updated forum-communities.sql instead.

update public.forum_questions
set subforum_slug = 'general'
where subforum_slug in (
  'full-stack-dev', 'ui-ux-design', 'product-strategy', 'digital-marketing',
  'data-science', 'mobile-development', 'copywriting', 'public-speaking',
  'photography', 'finance-investing', 'music-production', 'language-learning',
  'devops-cloud', 'video-editing', 'career-coaching', 'cybersecurity'
);

insert into public.forum_communities (slug, title, description, category, image_url, is_official)
values
  (
    'general',
    'General',
    'Everyday discussion about SkillBridge, learning, and anything that doesn’t need its own community yet',
    'General',
    null,
    true
  ),
  (
    'skill-swaps',
    'Skill Swaps',
    'Find swap partners, share session tips, and talk through what worked (or didn’t)',
    'General',
    null,
    true
  ),
  (
    'learning-help',
    'Learning Help',
    'Ask questions, unblock yourself, and help others get unstuck',
    'Education',
    null,
    true
  )
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  is_official = true;

delete from public.forum_communities
where is_official = true
  and slug not in ('general', 'skill-swaps', 'learning-help')
  and created_by is null;

alter table public.forum_communities
  add column if not exists visibility text not null default 'public';

alter table public.forum_communities
  add column if not exists accent_color text not null default 'brand';
