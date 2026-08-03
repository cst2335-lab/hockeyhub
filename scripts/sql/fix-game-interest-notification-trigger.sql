-- Fix game interest → notification trigger schema mismatch
-- Date: 2026-08-03
-- Project: old-gogohockey (ivrralpjkxmbgultqimc)
--
-- Symptom: POST /api/games/interest returned 500 "Failed to save interest"
-- Cause: AFTER INSERT trigger create_game_interest_notification() inserted into
--        notifications.related_game_id / related_user_id (columns do not exist).
-- Actual notifications columns include: related_id, link.
--
-- Applied via Supabase migration: fix_game_interest_notification_trigger
-- Kept notify_game_interest() as the live notification trigger; dropped the
-- broken duplicate trigger. Function body updated to match current schema for safety.

DROP TRIGGER IF EXISTS trigger_game_interest_notification ON public.game_interests;

CREATE OR REPLACE FUNCTION public.create_game_interest_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_game_title TEXT;
  v_game_owner_id UUID;
  v_interested_user_name TEXT;
BEGIN
  SELECT title, created_by INTO v_game_title, v_game_owner_id
  FROM game_invitations
  WHERE id = NEW.game_id;

  IF v_game_owner_id IS NULL OR v_game_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, 'Someone') INTO v_interested_user_name
  FROM profiles
  WHERE id = NEW.user_id;

  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link,
    related_id
  ) VALUES (
    v_game_owner_id,
    'game_interest',
    'New interest in your game',
    COALESCE(v_interested_user_name, 'Someone') || ' is interested in your game: ' || COALESCE(v_game_title, 'Untitled'),
    '/games/' || NEW.game_id::text,
    NEW.game_id
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'create_game_interest_notification failed: %', SQLERRM;
    RETURN NEW;
END;
$function$;
