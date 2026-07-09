-- 20260709_read_tracking_fix.sql
-- Fix: czas odczytu z serwera (eliminacja rozjazdu zegarów klient/serwer)
-- Wykonane ręcznie w Supabase SQL Editor 2026-07-09

CREATE OR REPLACE FUNCTION public.mark_match_read(p_match_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- tylko uczestnik matcha może oznaczyć go jako przeczytany
  IF NOT EXISTS (
    SELECT 1 FROM matches
    WHERE id = p_match_id
      AND (user_a = auth.uid() OR user_b = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Not a participant of this match';
  END IF;

  INSERT INTO match_reads (match_id, user_id, last_read_at)
  VALUES (p_match_id, auth.uid(), now())
  ON CONFLICT (match_id, user_id)
  DO UPDATE SET last_read_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.touch_matches_seen()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles SET last_seen_matches_at = now() WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.mark_match_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_matches_seen() TO authenticated;
