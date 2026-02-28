-- Mark top 20 rink images as manually verified.
-- Run in Supabase SQL Editor after human review of those 20 records.
-- Alternative (CLI): npm run db:mark-top20-images -- --apply

WITH top_20 AS (
  SELECT id
  FROM rinks
  WHERE image_url IS NOT NULL
    AND image_url <> ''
  ORDER BY name ASC
  LIMIT 20
)
UPDATE rinks
SET image_verified = true
WHERE id IN (SELECT id FROM top_20);

-- Optional: rollback if needed
-- UPDATE rinks
-- SET image_verified = false
-- WHERE id IN (SELECT id FROM top_20);
