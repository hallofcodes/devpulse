CREATE OR REPLACE FUNCTION sync_conversation_type()
RETURNS TRIGGER AS $$
BEGIN
  NEW.type := (
    SELECT type
    FROM conversations
    WHERE id = NEW.conversation_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS conversation_type_trigger ON conversation_participants;

CREATE TRIGGER conversation_type_trigger
BEFORE INSERT ON conversation_participants
FOR EACH ROW
EXECUTE FUNCTION sync_conversation_type();
