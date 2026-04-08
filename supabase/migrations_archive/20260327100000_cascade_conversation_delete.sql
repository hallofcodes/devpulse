DO $$
BEGIN
  -- Drop existing constraints if they exist
  ALTER TABLE conversation_participants DROP CONSTRAINT IF EXISTS conversation_participants_conversation_id_fkey;
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

  -- Add constraints with cascade
  ALTER TABLE conversation_participants ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
  ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
END $$;
