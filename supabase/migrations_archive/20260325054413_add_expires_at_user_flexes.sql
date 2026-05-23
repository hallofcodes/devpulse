alter table public.user_flexes
add column if not exists expires_at timestamp with time zone;

update public.user_flexes
set expires_at = coalesce(expires_at, created_at + interval '24 hours');

alter table public.user_flexes
alter column expires_at set default (now() + interval '24 hours');

alter table public.user_flexes
alter column expires_at set not null;
