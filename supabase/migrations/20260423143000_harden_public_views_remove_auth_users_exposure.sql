-- Harden public views to avoid exposing auth.users and remove security definer behavior.
-- Keeps existing column contracts so app queries do not break.

CREATE OR REPLACE VIEW public.top_user_stats AS
SELECT
  us.user_id,
  us.total_seconds,
  ('coder_' || left(us.user_id::text, 8))::character varying(255) AS email,
  us.categories
FROM public.user_stats us;

CREATE OR REPLACE VIEW public.leaderboard_members_view AS
SELECT
  lm.id,
  lm.leaderboard_id,
  lm.user_id,
  lm.role,
  ('coder_' || left(lm.user_id::text, 8))::character varying(255) AS email,
  us.total_seconds,
  us.languages,
  us.operating_systems,
  us.editors
FROM public.leaderboard_members lm
LEFT JOIN public.user_stats us ON lm.user_id = us.user_id;

-- Explicitly enforce invoker semantics for Postgres versions supporting this option.
ALTER VIEW public.top_user_stats SET (security_invoker = true);
ALTER VIEW public.leaderboard_members_view SET (security_invoker = true);
