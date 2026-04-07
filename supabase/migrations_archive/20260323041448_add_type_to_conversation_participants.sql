ALTER TABLE conversation_participants
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'private';

UPDATE conversation_participants
SET type = 'global'
WHERE conversation_id = '00000000-0000-0000-0000-000000000001';
