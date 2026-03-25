alter table public.user_flexes
add column expires_at timestamp with time zone default (now() + interval '24 hours');
