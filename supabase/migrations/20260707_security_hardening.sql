-- ============================================================
-- RefSwap — migracja naprawcza #1: bezpieczeństwo i integralność
-- Wykonana ręcznie w Supabase SQL Editor 2026-07-07
-- ============================================================

-- ── 0. Sprzątanie danych testowych ──
DELETE FROM matches m USING matches m2
WHERE m.status = 'active' AND m2.status = 'active'
  AND m.id > m2.id
  AND LEAST(m.user_a, m.user_b) = LEAST(m2.user_a, m2.user_b)
  AND GREATEST(m.user_a, m.user_b) = GREATEST(m2.user_a, m2.user_b);

UPDATE listings SET is_active = false
WHERE is_active = true
  AND id NOT IN (
    SELECT DISTINCT ON (user_id) id FROM listings
    WHERE is_active = true
    ORDER BY user_id, created_at DESC
  );

-- ── 1. Matching po stronie bazy ──
CREATE OR REPLACE FUNCTION public.handle_mutual_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  my_listing_id uuid;
  their_user_id uuid;
BEGIN
  SELECT id INTO my_listing_id FROM listings
  WHERE user_id = NEW.from_user AND is_active = true LIMIT 1;
  IF my_listing_id IS NULL THEN RETURN NEW; END IF;
  SELECT user_id INTO their_user_id FROM listings WHERE id = NEW.to_listing;
  IF their_user_id IS NULL OR their_user_id = NEW.from_user THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM likes WHERE from_user = their_user_id AND to_listing = my_listing_id) THEN
    INSERT INTO matches (user_a, user_b, listing_a, listing_b)
    VALUES (NEW.from_user, their_user_id, my_listing_id, NEW.to_listing)
    ON CONFLICT ((LEAST(user_a, user_b)), (GREATEST(user_a, user_b)))
      WHERE status = 'active' DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- ── 2. Unikalność pary matchy ──
CREATE UNIQUE INDEX IF NOT EXISTS matches_unique_active_pair
  ON matches (LEAST(user_a, user_b), GREATEST(user_a, user_b))
  WHERE status = 'active';

DROP TRIGGER IF EXISTS on_like_check_match ON likes;
CREATE TRIGGER on_like_check_match AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_mutual_like();

-- ── 3. Matches: klient tylko czyta ──
DROP POLICY IF EXISTS "Insert matches" ON matches;
DROP POLICY IF EXISTS "Update own matches" ON matches;
REVOKE INSERT, UPDATE, DELETE ON matches FROM authenticated, anon;

-- ── 4. Profiles: koniec z publicznym dostępem ──
DROP POLICY IF EXISTS "Profiles are public" ON profiles;
DROP POLICY IF EXISTS "Read own profile" ON profiles;
DROP POLICY IF EXISTS "Read matched profiles" ON profiles;
CREATE POLICY "Read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Read matched profiles" ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM matches
    WHERE matches.status = 'active'
      AND ((matches.user_a = auth.uid() AND matches.user_b = profiles.id)
        OR (matches.user_b = auth.uid() AND matches.user_a = profiles.id))));
CREATE OR REPLACE VIEW public.public_profiles AS SELECT id, country FROM profiles;
GRANT SELECT ON public.public_profiles TO authenticated;

-- ── 5. Likes ──
DROP POLICY IF EXISTS "See likes on my listings" ON likes;
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_from_user_to_listing_unique;

-- ── 6. Listings ──
DROP POLICY IF EXISTS "Aktywne oferty są publiczne" ON listings;
DROP POLICY IF EXISTS "Użytkownik zarządza swoją ofertą" ON listings;
CREATE UNIQUE INDEX IF NOT EXISTS one_active_listing_per_user
  ON listings (user_id) WHERE is_active = true;

-- ── 7. Reports ──
GRANT INSERT ON reports TO authenticated;

-- ── 8. Higiena uprawnień ──
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
