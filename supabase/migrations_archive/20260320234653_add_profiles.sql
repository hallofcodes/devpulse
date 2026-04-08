/* ---- Profile ----- */
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  wakatime_api_key text default null unique,
  created_at timestamp with time zone NOT NULL default now()
);

/* ---- RLS Policies ----- */
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

/* ---- Auto Create Profile on Signup Trigger ----- */
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
