-- #2 Incoming likes — kolumna note + RPC (anonimowy odczyt) + badge count

-- 1. Notatka przy lajkowaniu (opcjonalna, max 140 znaków)
ALTER TABLE public.likes
  ADD COLUMN IF NOT EXISTS note text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'likes_note_length') THEN
    ALTER TABLE public.likes
      ADD CONSTRAINT likes_note_length CHECK (note IS NULL OR char_length(note) <= 140);
  END IF;
END $$;

-- 2. Główny RPC: oferty osób, które polajkowały MOJĄ ofertę — anonimowo (bez user_id)
CREATE OR REPLACE FUNCTION public.get_incoming_likes()
RETURNS TABLE (
  like_id uuid,
  liked_at timestamptz,
  note text,
  liker_listing_id uuid,
  country text,
  brand text,
  model text,
  reference text,
  price_tier text,
  geo_scope text,
  open_to_topup boolean,
  photos text[],
  wanted_references text[]
)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT
    l.id, l.created_at, l.note,
    liker.id,
    p.country,
    liker.brand, liker.model, liker.reference,
    liker.price_tier, liker.geo_scope, liker.open_to_topup,
    liker.photos, liker.wanted_references
  FROM public.likes l
  JOIN public.listings mine
    ON mine.id = l.to_listing AND mine.user_id = auth.uid() AND mine.is_active
  JOIN public.listings liker
    ON liker.user_id = l.from_user AND liker.is_active
  JOIN public.profiles p
    ON p.id = l.from_user
  WHERE NOT EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.status = 'active'
      AND ((m.user_a = auth.uid() AND m.user_b = l.from_user)
        OR (m.user_b = auth.uid() AND m.user_a = l.from_user))
  )
  ORDER BY l.created_at DESC;
$$;

REVOKE EXECUTE ON FUNCTION public.get_incoming_likes() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_incoming_likes() TO authenticated;

-- 3. Lekki licznik dla badge (polling co 30s nie ciągnie całych danych)
CREATE OR REPLACE FUNCTION public.get_incoming_likes_count()
RETURNS integer
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$ SELECT count(*)::int FROM public.get_incoming_likes(); $$;

REVOKE EXECUTE ON FUNCTION public.get_incoming_likes_count() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_incoming_likes_count() TO authenticated;