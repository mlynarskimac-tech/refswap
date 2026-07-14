-- ============================================================
-- RefSwap — anonimowość ofert, Faza B: usunięcie otwartej
-- polityki SELECT na listings (Browse czyta z public_listings)
-- (wykonane ręcznie w Supabase SQL Editor 2026-07-14)
-- ============================================================

drop policy if exists "Active listings are public" on public.listings;