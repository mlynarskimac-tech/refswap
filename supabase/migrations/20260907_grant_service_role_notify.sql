-- Grant SELECT dla service_role na listings i profiles.
-- Wymagane przez Edge Function notify-incoming-like: po hardeningu tabele mają
-- odebrany SELECT (dostęp klienta wyłącznie przez widoki public_*), przez co
-- service_role odbijał się o permission denied (42501) — Postgres sprawdza
-- uprawnienia tabelowe przed RLS. Grant nie osłabia anonimowości: service_role
-- działa wyłącznie server-side (secret key w Edge Function), nigdy we frontendzie.
grant select on public.listings to service_role;
grant select on public.profiles to service_role;
