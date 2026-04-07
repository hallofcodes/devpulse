ALTER TABLE conversation_participants
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT to_timestamp(0),
ADD COLUMN IF NOT EXISTS last_read_at timestamptz NOT NULL DEFAULT now();

UPDATE conversation_participants
SET
  last_seen_at = COALESCE(last_seen_at, to_timestamp(0)),
  last_read_at = COALESCE(last_read_at, now());

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_last_seen_at
ON conversation_participants (user_id, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_sender
ON messages (conversation_id, created_at DESC, sender_id);
