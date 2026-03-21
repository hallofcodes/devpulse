alter table public.leaderboards
add constraint leaderboards_name_length
check (length(trim(name)) between 3 and 50);

alter table public.leaderboards
add constraint leaderboards_description_length
check (description is null or length(description) <= 150);

alter table public.leaderboards
add constraint leaderboards_join_code_format
check (join_code ~ '^[A-Za-z0-9]{1,8}$');


create policy "Owner can delete leaderboard"
on public.leaderboards
for delete
using (auth.uid() = owner_id);
