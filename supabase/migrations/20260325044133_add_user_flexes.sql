create table public.user_flexes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  user_email text NOT NULL,
  project_name text NOT NULL,
  project_description text NOT NULL,
  project_url text NOT NULL,
  project_time text NOT NULL,
  is_open_source boolean NOT NULL default false,
  open_source_url text NOT NULL default '',
  created_at timestamp with time zone NOT NULL default now()
);

alter table public.user_flexes enable row level security;

/* ---- RLS Policy ----- */
create policy "Public Access" on public.user_flexes
for select
using (true);

create policy "User Flexes" on public.user_flexes
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function flex_project(p_user_id uuid, p_project jsonb)
returns text as $$
begin
    if exists (
        select 1
        from public.user_flexes
        where user_id = p_user_id
          and flexed_at > now() - interval '24 hours'
    ) then
        return 'You can only flex once every 24 hours';
    else
        insert into public.user_flexes(user_id, project)
        values (p_user_id, p_project);
        return 'Project flexed successfully!';
    end if;
end;
$$ language plpgsql;
