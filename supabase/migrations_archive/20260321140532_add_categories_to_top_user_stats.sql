CREATE OR REPLACE VIEW top_user_stats AS
SELECT
  us.user_id,
  us.total_seconds,
  a.email,
  us.categories -- new column
FROM user_stats us
JOIN auth.users a ON us.user_id = a.id;
