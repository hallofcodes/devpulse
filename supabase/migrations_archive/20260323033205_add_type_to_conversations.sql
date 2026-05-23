ALTER TABLE conversations ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'private';
