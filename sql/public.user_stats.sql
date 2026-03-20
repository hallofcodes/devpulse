/* ---- User Stats ----- */
create table public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_seconds bigint not null,
  daily_average bigint default 0,
  languages jsonb not null,
  operating_systems jsonb not null,
  editors jsonb not null,
  machines jsonb default '[]'::jsonb,
  categories jsonb default '[]'::jsonb,
  dependencies jsonb default '[]'::jsonb,
  best_day jsonb default '{}'::jsonb,
  daily_stats jsonb default '[]'::jsonb,
  last_fetched_at timestamp with time zone default now()
);

alter table public.user_stats enable row level security;

/* ---- RLS Policy ----- */
create policy "Users can insert their stats"
on public.user_stats
for insert
with check (auth.uid() = user_id);

create policy "Users can update their stats"
on public.user_stats
for update
using (auth.uid() = user_id);

create policy "Authenticated users can view stats"
on public.user_stats
for select
using (auth.role() = 'authenticated');
