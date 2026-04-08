/* ---- User Projects Stats ----- */
create table public.user_projects (
  user_id uuid primary key references auth.users(id) on delete cascade,
  projects jsonb default '[]'::jsonb,
  last_fetched_at timestamp with time zone NOT NULL default now()
);

alter table public.user_projects enable row level security;

create policy "Users can view their own projects"
on public.user_projects
for select
using (auth.uid() = user_id);

create policy "Users can insert their own projects"
on public.user_projects
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own projects"
on public.user_projects
for update
using (auth.uid() = user_id);
