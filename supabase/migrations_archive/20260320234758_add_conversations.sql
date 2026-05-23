/* ---- Conversations ----- */
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

/* ---- Participants ----- */
CREATE TABLE conversation_participants (
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  email text NOT NULL,
  PRIMARY KEY(conversation_id, user_id)
);

/* ---- Messages ----- */
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_conversation_member(
  target_conversation_id uuid,
  target_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = target_conversation_id
      AND cp.user_id = target_user_id
  );
$$;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

/* ---- RLS Policies ----- */
CREATE POLICY "participants can read conversations"
ON conversations
FOR SELECT
USING (public.is_conversation_member(id, auth.uid()));

CREATE POLICY "authenticated users can create conversations"
ON conversations
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "participants can update conversations"
ON conversations
FOR UPDATE
USING (public.is_conversation_member(id, auth.uid()));

CREATE POLICY "participants can delete conversations"
ON conversations
FOR DELETE
USING (public.is_conversation_member(id, auth.uid()));

CREATE POLICY "participants can read participant list"
ON conversation_participants
FOR SELECT
USING (public.is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "authenticated users can add participants"
ON conversation_participants
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "users can update their own participant row"
ON conversation_participants
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can remove their own participant row"
ON conversation_participants
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "participants can read messages"
ON messages
FOR SELECT
USING (public.is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "participants can send messages"
ON messages
FOR INSERT
WITH CHECK (public.is_conversation_member(conversation_id, auth.uid()));
