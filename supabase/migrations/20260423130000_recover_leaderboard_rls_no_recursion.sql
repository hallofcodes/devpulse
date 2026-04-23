-- Recovery migration: remove recursive RLS interaction between
-- leaderboards <-> leaderboard_members policies.
-- This restores invite lookup stability and membership reads.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'leaderboards'
      AND policyname = 'Public or member leaderboards are viewable'
  ) THEN
    DROP POLICY "Public or member leaderboards are viewable" ON public.leaderboards;
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'leaderboard_members'
      AND policyname = 'Users can see own memberships and visible leaderboard memberships'
  ) THEN
    DROP POLICY "Users can see own memberships and visible leaderboard memberships" ON public.leaderboard_members;
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
      AND policyname = 'Public leaderboards are viewable'
  ) THEN
    CREATE POLICY "Public leaderboards are viewable"
    ON public.leaderboards
    FOR SELECT
    USING (is_public = true OR owner_id = auth.uid());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'leaderboard_members'
      AND policyname = 'Users can see memberships for visible leaderboards'
  ) THEN
    CREATE POLICY "Users can see memberships for visible leaderboards"
    ON public.leaderboard_members
    FOR SELECT
    USING (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1
        FROM public.leaderboards l
        WHERE l.id = leaderboard_members.leaderboard_id
          AND (l.is_public = true OR l.owner_id = auth.uid())
      )
    );
  END IF;
END
$$;
