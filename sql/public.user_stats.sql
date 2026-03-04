/* ---- User Stats ----- */
create table public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_seconds bigint not null,
  languages jsonb not null,
  operating_systems jsonb not null,
  editors jsonb not null,
  last_fetched_at timestamp with time zone default now()
);

alter table public.user_stats enable row level security;

/* ---- RLS Policy ----- */
create policy "Users can insert their stats"
on public.wakatime_stats
for insert
with check (auth.uid() = user_id);

create policy "Users can update their stats"
on public.wakatime_stats
for update
using (auth.uid() = user_id);

create policy "Authenticated users can view stats"
on public.user_stats
for select
using (auth.role() = 'authenticated');
