/* ---- User Stats ----- */
create table public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_seconds bigint NOT NULL default 0,
  daily_average bigint NOT NULL default 0,
  languages jsonb NOT NULL default '[]'::jsonb,
  operating_systems jsonb NOT NULL default '[]'::jsonb,
  editors jsonb NOT NULL default '[]'::jsonb,
  machines jsonb NOT NULL default '[]'::jsonb,
  categories jsonb NOT NULL default '[]'::jsonb,
  dependencies jsonb NOT NULL default '[]'::jsonb,
  best_day jsonb NOT NULL default '{}'::jsonb,
  daily_stats jsonb NOT NULL default '[]'::jsonb,
  last_fetched_at timestamp with time zone NOT NULL default now()
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
