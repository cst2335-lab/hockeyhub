-- Add rink image-trust related columns if missing.
-- Run in Supabase SQL Editor before batch image verification scripts.

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS image_verified boolean DEFAULT false;

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS data_source text;

ALTER TABLE IF EXISTS rinks
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

-- Optional backfill from legacy columns where available:
UPDATE rinks
SET
  data_source = COALESCE(data_source, source),
  last_synced_at = COALESCE(last_synced_at, last_synced)
WHERE true;
