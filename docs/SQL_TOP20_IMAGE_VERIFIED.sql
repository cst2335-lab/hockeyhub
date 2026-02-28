-- Mark top 20 rink images as manually verified.
-- Priority: records with image_url. Fallback: first 20 by name when image_url is empty for all rows.
-- Run in Supabase SQL Editor after human review of those 20 records.
-- Alternative (CLI): npm run db:mark-top20-images -- --apply
-- Prerequisite: run SQL_RINK_IMAGE_COLUMNS.sql if image columns do not exist yet.

WITH top_20_with_image AS (
  SELECT id
  FROM rinks
  WHERE image_url IS NOT NULL
    AND image_url <> ''
  ORDER BY name ASC
  LIMIT 20
),
fallback_top_20 AS (
  SELECT id
  FROM rinks
  ORDER BY name ASC
  LIMIT 20
),
target_top_20 AS (
  SELECT id FROM top_20_with_image
  UNION ALL
  SELECT id
  FROM fallback_top_20
  WHERE NOT EXISTS (SELECT 1 FROM top_20_with_image)
)
UPDATE rinks
SET image_verified = true
WHERE id IN (SELECT id FROM target_top_20);

-- Optional: rollback if needed
-- UPDATE rinks
-- SET image_verified = false
-- WHERE id IN (SELECT id FROM target_top_20);
