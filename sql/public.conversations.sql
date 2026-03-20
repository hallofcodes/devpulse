/* ---- Conversations ----- */
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

/* ---- Participants ----- */
CREATE TABLE conversation_participants (
  conversation_id uuid REFERENCES conversations(id),
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  PRIMARY KEY(conversation_id, user_id)
);

/* ---- Messages ----- */
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id),
  sender_id uuid REFERENCES auth.users(id),
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

/* ---- RLS Policies ----- */
CREATE POLICY "participants can read messages" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
  )
);

CREATE POLICY "participants can send messages" ON messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
  )
);
