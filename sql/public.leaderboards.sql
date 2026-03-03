/* ---- Leaderboards ----- */
create table public.leaderboards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_public boolean default true,
  owner_id uuid references auth.users(id) on delete cascade,
  join_code text unique,
  created_at timestamptz default now()
);

alter table public.leaderboards enable row level security;

/* ---- Leaderboards Members ----- */
create table public.leaderboard_members (
  id uuid primary key default gen_random_uuid(),
  leaderboard_id uuid references public.leaderboards(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member', -- owner | member
  joined_at timestamptz default now(),
  unique (leaderboard_id, user_id)
);

alter table public.leaderboard_members enable row level security;

/* ---- RLS Policies ----- */
create policy "Public leaderboards are viewable"
on public.leaderboards
for select
using (is_public = true OR owner_id = auth.uid());

create policy "Users can create leaderboards"
on public.leaderboards
for insert
with check (auth.uid() = owner_id);

create policy "Owner can update leaderboard"
on public.leaderboards
for update
using (auth.uid() = owner_id);

/* ---- Members Policies ----- */
create policy "Users can see members of joined leaderboards"
on public.leaderboard_members
for select
using (
  user_id = auth.uid()
  OR leaderboard_id IN (
    select leaderboard_id
    from public.leaderboard_members
    where user_id = auth.uid()
  )
);

create policy "Users can join leaderboard"
on public.leaderboard_members
for insert
with check (auth.uid() = user_id);
