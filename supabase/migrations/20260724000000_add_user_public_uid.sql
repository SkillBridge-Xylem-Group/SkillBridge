-- Public numeric UID shown on user profiles (e.g. UID: 100042).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS public_uid BIGINT;

CREATE SEQUENCE IF NOT EXISTS public.users_public_uid_seq
  START WITH 100001
  INCREMENT BY 1
  NO MINVALUE;

-- Backfill existing users (oldest accounts get lower numbers).
WITH numbered AS (
  SELECT
    id,
    100000 + ROW_NUMBER() OVER (ORDER BY created_at ASC NULLS LAST, id ASC) AS uid
  FROM public.users
  WHERE public_uid IS NULL
)
UPDATE public.users AS u
SET public_uid = n.uid
FROM numbered AS n
WHERE u.id = n.id;

SELECT setval(
  'public.users_public_uid_seq',
  GREATEST(COALESCE((SELECT MAX(public_uid) FROM public.users), 100000) + 1, 100001),
  false
);

ALTER TABLE public.users
  ALTER COLUMN public_uid SET DEFAULT nextval('public.users_public_uid_seq');

CREATE UNIQUE INDEX IF NOT EXISTS users_public_uid_key ON public.users (public_uid);
