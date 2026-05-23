/* ---- Leaderboards ----- */
create table public.leaderboards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_public boolean NOT NULL default true,
  owner_id uuid NOT NULL references auth.users(id) on delete cascade,
  join_code text not null unique,
  created_at timestamptz NOT NULL default now()
);

alter table public.leaderboards enable row level security;

/* ---- Leaderboards Members ----- */
create table public.leaderboard_members (
  id uuid primary key default gen_random_uuid(),
  leaderboard_id uuid NOT NULL references public.leaderboards(id) on delete cascade,
  user_id uuid NOT NULL references auth.users(id) on delete cascade,
  role text NOT NULL default 'member', -- owner | member
  joined_at timestamptz NOT NULL default now(),
  unique (leaderboard_id, user_id)
);

alter table public.leaderboard_members enable row level security;

/* ---- Leaderboards Members View ----- */
create view public.leaderboard_members_view as
select
  lm.id,
  lm.leaderboard_id,
  lm.user_id,
  lm.role,
  u.email,
  us.total_seconds,
  us.languages,
  us.operating_systems,
  us.editors
from public.leaderboard_members lm
join auth.users u on lm.user_id = u.id
left join public.user_stats us on lm.user_id = us.user_id;

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
create policy "Users can see memberships for visible leaderboards"
on public.leaderboard_members
for select
using (
  exists (
    select 1
    from public.leaderboards l
    where l.id = leaderboard_members.leaderboard_id
      and (
        l.is_public = true
        or l.owner_id = auth.uid()
        or exists (
          select 1
          from public.leaderboard_members lm
          where lm.leaderboard_id = l.id
            and lm.user_id = auth.uid()
        )
      )
  )
);

create policy "Users can join leaderboard"
on public.leaderboard_members
for insert
with check (auth.uid() = user_id);

create policy "Members can leave leaderboard"
on public.leaderboard_members
for delete
using (user_id = auth.uid());

create policy "Owner can manage members"
on public.leaderboard_members
for delete
using (
  leaderboard_id IN (
    select id
    from public.leaderboards
    where owner_id = auth.uid()
  )
);
