-- ============================================================
-- RefSwap — anonimowość ofert na poziomie bazy
-- Faza A: widok public_listings + polityka odczytu po matchu
-- (wykonane ręcznie w Supabase SQL Editor 2026-07-14)
-- ============================================================

-- Widok publiczny ofert: tylko bezpieczne kolumny, BEZ user_id, z krajem
create or replace view public.public_listings as
select
  l.id,
  l.brand,
  l.model,
  l.reference,
  l.price_tier,
  l.geo_scope,
  l.open_to_topup,
  l.photos,
  l.wanted_references,
  l.created_at,
  p.country,
  coalesce(l.user_id = auth.uid(), false) as is_mine
from public.listings l
join public.profiles p on p.id = l.user_id
where l.is_active = true;

grant select on public.public_listings to authenticated, anon;

-- Po matchu wolno czytać pełną ofertę partnera z tabeli bazowej
create policy "Read listings in my matches" on public.listings
for select to authenticated
using (
  exists (
    select 1 from public.matches m
    where m.status = 'active'
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
      and (m.listing_a = listings.id or m.listing_b = listings.id)
  )
);