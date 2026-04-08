-- Ensure the global conversation row exists and has the expected type.
INSERT INTO public.conversations (id, type)
VALUES ('00000000-0000-0000-0000-000000000001', 'global')
ON CONFLICT (id) DO UPDATE
SET type = EXCLUDED.type;

-- Backfill global chat membership for all existing auth users.
INSERT INTO public.conversation_participants (conversation_id, user_id, email)
SELECT
  '00000000-0000-0000-0000-000000000001',
  u.id,
  COALESCE(u.email, CONCAT(u.id::text, '@user.local'))
FROM auth.users u
ON CONFLICT (conversation_id, user_id) DO UPDATE
SET email = EXCLUDED.email;

-- Keep future auth users automatically enrolled in global chat.
CREATE OR REPLACE FUNCTION public.ensure_user_in_global_chat()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE id = '00000000-0000-0000-0000-000000000001'
  ) THEN
    INSERT INTO public.conversation_participants (conversation_id, user_id, email)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      NEW.id,
      COALESCE(NEW.email, CONCAT(NEW.id::text, '@user.local'))
    )
    ON CONFLICT (conversation_id, user_id) DO UPDATE
    SET email = EXCLUDED.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_join_global_chat ON auth.users;

CREATE TRIGGER on_auth_user_join_global_chat
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_user_in_global_chat();
