ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

-- allow authenticated users to upload
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_policies
		WHERE schemaname = 'storage'
			AND tablename = 'objects'
			AND policyname = 'Allow uploads by owner'
	) THEN
		CREATE POLICY "Allow uploads by owner"
		ON storage.objects
		FOR INSERT
		TO authenticated
		WITH CHECK (auth.uid() = owner);
	END IF;
END
$$;
