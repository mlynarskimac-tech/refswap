-- 20260910_public_browse_anon_access.sql
-- Publiczny Browse: rola anon (niezalogowani) czyta zanonimizowane widoki.
grant select on public.public_listings to anon;
grant select on public.public_profiles to anon;