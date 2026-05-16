-- =============================================================================
-- Rinks: image columns + optional Top 20 verification (Supabase SQL Editor)
-- Replaces former SQL_RINK_IMAGE_COLUMNS.sql + SQL_TOP20_IMAGE_VERIFIED.sql
-- =============================================================================
-- Run SECTION 1 first if columns may be missing.
-- Run SECTION 2 after human review (or use: npm run db:mark-top20-images -- --apply)
-- Paste statements only (no filename/line references in Supabase UI).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- SECTION 1 — Add rink image-trust columns if missing
-- ---------------------------------------------------------------------------

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS image_verified boolean DEFAULT false;

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS data_source text;

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'rinks'
      AND column_name = 'source'
  ) THEN
    UPDATE rinks
    SET data_source = COALESCE(data_source, source)
    WHERE data_source IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'rinks'
      AND column_name = 'last_synced'
  ) THEN
    UPDATE rinks
    SET last_synced_at = COALESCE(last_synced_at, last_synced)
    WHERE last_synced_at IS NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- SECTION 2 — Mark top 20 rink images as manually verified
-- Priority: records with image_url. Fallback: first 20 by name if none.
-- Prerequisite: SECTION 1 applied (columns exist).
-- ---------------------------------------------------------------------------

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

-- Optional rollback:
-- UPDATE rinks SET image_verified = false WHERE id IN (SELECT id FROM target_top_20);
