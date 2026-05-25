create table public.user_flexes (
  id uuid primary key default gen_random_uuid(),
    user_id uuid NOT NULL references auth.users(id) on delete cascade,
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
declare
        v_project_name text;
        v_project_description text;
        v_project_url text;
        v_project_time text;
        v_is_open_source boolean;
        v_open_source_url text;
        v_user_email text;
begin
        v_project_name := coalesce(
            nullif(trim(p_project->>'project_name'), ''),
            nullif(trim(p_project->>'name'), '')
        );
        v_project_description := coalesce(nullif(trim(p_project->>'project_description'), ''), '');
        v_project_url := coalesce(nullif(trim(p_project->>'project_url'), ''), '');
        v_project_time := coalesce(
            nullif(trim(p_project->>'project_time'), ''),
            nullif(trim(p_project->>'text'), ''),
            ''
        );
        v_is_open_source := lower(coalesce(p_project->>'is_open_source', 'false')) in ('true', '1', 't', 'yes', 'y');
        v_open_source_url := coalesce(nullif(trim(p_project->>'open_source_url'), ''), '');
        v_user_email := coalesce(nullif(trim(p_project->>'user_email'), ''), concat(p_user_id::text, '@user.local'));

        if v_project_name is null then
                return 'Project name is required';
        end if;

    if exists (
        select 1
        from public.user_flexes
        where user_id = p_user_id
                    and created_at > now() - interval '24 hours'
    ) then
        return 'You can only flex once every 24 hours';
    else
                insert into public.user_flexes(
                    user_id,
                    user_email,
                    project_name,
                    project_description,
                    project_url,
                    project_time,
                    is_open_source,
                    open_source_url
                )
                values (
                    p_user_id,
                    v_user_email,
                    v_project_name,
                    v_project_description,
                    v_project_url,
                    v_project_time,
                    v_is_open_source,
                    v_open_source_url
                );
        return 'Project flexed successfully!';
    end if;
end;
$$ language plpgsql security definer set search_path = public;
