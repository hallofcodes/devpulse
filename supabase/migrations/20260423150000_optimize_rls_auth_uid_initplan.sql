-- Performance hardening for RLS policy evaluation:
-- Rewrites auth.uid() calls to (select auth.uid()) so PostgreSQL can init-plan once per statement.
-- This keeps policy behavior identical while reducing per-row function re-evaluation overhead.

DO $$
DECLARE
  p record;
  using_expr text;
  check_expr text;
  roles_clause text;
  create_sql text;
BEGIN
  FOR p IN
    SELECT
      schemaname,
      tablename,
      policyname,
      permissive,
      cmd,
      roles,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        coalesce(qual, '') LIKE '%auth.uid()%'
        OR coalesce(with_check, '') LIKE '%auth.uid()%'
      )
  LOOP
    using_expr := CASE
      WHEN p.qual IS NULL THEN NULL
      ELSE replace(p.qual, 'auth.uid()', '(select auth.uid())')
    END;

    check_expr := CASE
      WHEN p.with_check IS NULL THEN NULL
      ELSE replace(p.with_check, 'auth.uid()', '(select auth.uid())')
    END;

    SELECT string_agg(
      CASE
        WHEN role_name = 'public' THEN 'public'
        ELSE quote_ident(role_name)
      END,
      ', '
    )
    INTO roles_clause
    FROM unnest(p.roles) AS role_name;

    IF roles_clause IS NULL OR roles_clause = '' THEN
      roles_clause := 'public';
    END IF;

    EXECUTE format(
      'DROP POLICY %I ON %I.%I',
      p.policyname,
      p.schemaname,
      p.tablename
    );

    create_sql := format(
      'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
      p.policyname,
      p.schemaname,
      p.tablename,
      p.permissive,
      p.cmd,
      roles_clause
    );

    IF using_expr IS NOT NULL THEN
      create_sql := create_sql || format(' USING (%s)', using_expr);
    END IF;

    IF check_expr IS NOT NULL THEN
      create_sql := create_sql || format(' WITH CHECK (%s)', check_expr);
    END IF;

    EXECUTE create_sql;
  END LOOP;
END
$$;
