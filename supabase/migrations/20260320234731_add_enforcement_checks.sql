DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'leaderboards_name_length'
			AND conrelid = 'public.leaderboards'::regclass
	) THEN
		alter table public.leaderboards
		add constraint leaderboards_name_length
		check (length(trim(name)) between 3 and 50);
	END IF;
END
$$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'leaderboards_description_length'
			AND conrelid = 'public.leaderboards'::regclass
	) THEN
		alter table public.leaderboards
		add constraint leaderboards_description_length
		check (description is null or length(description) <= 150);
	END IF;
END
$$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'leaderboards_join_code_format'
			AND conrelid = 'public.leaderboards'::regclass
	) THEN
		alter table public.leaderboards
		add constraint leaderboards_join_code_format
		check (join_code ~ '^[A-Za-z0-9]{1,8}$');
	END IF;
END
$$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_policies
		WHERE schemaname = 'public'
			AND tablename = 'leaderboards'
			AND policyname = 'Owner can delete leaderboard'
	) THEN
		create policy "Owner can delete leaderboard"
		on public.leaderboards
		for delete
		using (auth.uid() = owner_id);
	END IF;
END
$$;
