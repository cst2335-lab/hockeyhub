-- Optional hardening for game view dedupe (Assignment 4 demo-flow fix)
-- Safe to run in Supabase SQL Editor. Application already dedupes via SELECT
-- before INSERT; this unique index makes concurrent double-counts harder.
--
-- Does not change Stripe, messaging, or matching behavior.

CREATE UNIQUE INDEX IF NOT EXISTS game_views_game_id_viewer_id_uidx
  ON public.game_views (game_id, viewer_id);
