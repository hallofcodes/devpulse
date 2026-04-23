-- Allow users to unsend (delete) only their own messages.
CREATE POLICY "senders can unsend their own messages"
ON public.messages
FOR DELETE
USING ((select auth.uid()) = sender_id);
