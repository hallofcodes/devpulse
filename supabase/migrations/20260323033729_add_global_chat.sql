-- Add a global conversation
INSERT INTO public.conversations (id, type)
VALUES ('00000000-0000-0000-0000-000000000001', 'global')
ON CONFLICT (id) DO UPDATE
SET type = EXCLUDED.type;

INSERT INTO public.conversation_participants (
	conversation_id,
	user_id,
	email
)
SELECT
	'00000000-0000-0000-0000-000000000001',
	u.id,
	COALESCE(u.email, CONCAT(u.id::text, '@user.local'))
FROM auth.users u
ON CONFLICT (conversation_id, user_id) DO UPDATE
SET email = EXCLUDED.email;
