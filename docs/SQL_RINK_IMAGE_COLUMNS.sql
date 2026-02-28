-- Add rink image-trust related columns if missing.
-- Run in Supabase SQL Editor before batch image verification scripts.
-- IMPORTANT: paste SQL statements only (do not include filename/line references).

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS image_verified boolean DEFAULT false;

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS data_source text;

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

-- Optional backfill from legacy columns where available.
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
