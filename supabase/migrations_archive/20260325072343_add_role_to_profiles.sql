ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'profiles_role_check'
			AND conrelid = 'public.profiles'::regclass
	) THEN
		ALTER TABLE public.profiles
		ADD CONSTRAINT profiles_role_check
		CHECK (role IN ('user', 'admin'));
	END IF;
END
$$;
