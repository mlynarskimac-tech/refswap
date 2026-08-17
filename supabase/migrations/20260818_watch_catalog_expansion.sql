-- 20260818_watch_catalog_expansion.sql
-- Rozszerzenie katalogu: uzupelnienie plytkich modeli (klasyka) + kilka nowych modeli.
-- Trigger: brak referencji Patek 5205 (Annual Calendar mial tylko 5396).
-- Bezpieczne do wielokrotnego uruchomienia: kazdy wpis chroniony przez NOT EXISTS.
-- Wykonac recznie w Supabase SQL Editor, potem zapisac plik do supabase/migrations/.

-- =========================================================================
-- CZESC A: NOWE MODELE
-- =========================================================================

INSERT INTO watch_models (brand_id, name)
SELECT wb.id, m.name FROM watch_brands wb, (VALUES
  ('Yacht-Master 42'),
  ('1908')
) AS m(name)
WHERE wb.name = 'Rolex'
  AND NOT EXISTS (SELECT 1 FROM watch_models x WHERE x.brand_id = wb.id AND x.name = m.name);

INSERT INTO watch_models (brand_id, name)
SELECT wb.id, m.name FROM watch_brands wb, (VALUES
  ('Black Bay 54')
) AS m(name)
WHERE wb.name = 'Tudor'
  AND NOT EXISTS (SELECT 1 FROM watch_models x WHERE x.brand_id = wb.id AND x.name = m.name);

-- =========================================================================
-- CZESC B: NOWE REFERENCJE
-- =========================================================================

-- ---- PATEK PHILIPPE --------------------------------------------------

-- Annual Calendar (trigger 5205)
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('5205G-013', 'Charcoal-blue gradient dial · white gold', 'ultra'),
  ('5205R-001', 'Silvery dial · rose gold', 'ultra'),
  ('5146/1G-010', 'Silvery dial · white gold · bracelet', 'ultra'),
  ('5235/50R-001', 'Regulator · rose gold', 'ultra')
) AS r(ref, var, tier)
WHERE wb.name = 'Patek Philippe' AND wm.name = 'Annual Calendar'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- Nautilus
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('5711/1A-014', 'Olive-green dial · steel', 'ultra'),
  ('5980/1A-019', 'Chronograph · blue-black dial · steel', 'ultra'),
  ('5712/1R-001', 'Moonphase · power reserve · rose gold', 'ultra')
) AS r(ref, var, tier)
WHERE wb.name = 'Patek Philippe' AND wm.name = 'Nautilus'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- Aquanaut
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('5164A-001', 'Travel Time · black dial · steel', 'ultra'),
  ('5167R-001', 'Brown dial · rose gold', 'ultra')
) AS r(ref, var, tier)
WHERE wb.name = 'Patek Philippe' AND wm.name = 'Aquanaut'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- Calatrava
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('5226G-001', 'Grey dial · white gold · 40mm', 'ultra'),
  ('6007A-001', 'Blue dial · steel · limited', 'ultra')
) AS r(ref, var, tier)
WHERE wb.name = 'Patek Philippe' AND wm.name = 'Calatrava'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- ---- ROLEX -----------------------------------------------------------

-- Datejust 36
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126233', 'Champagne dial · steel & yellow gold · Jubilee', 'mid'),
  ('126234-GRN', 'Mint green dial · fluted bezel', 'mid')
) AS r(ref, var, tier)
WHERE wb.name = 'Rolex' AND wm.name = 'Datejust 36'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- Datejust 41
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126334-SLV', 'Silver dial · fluted bezel · Oyster', 'mid'),
  ('126300-SLT', 'Slate dial · smooth bezel · Oyster', 'mid')
) AS r(ref, var, tier)
WHERE wb.name = 'Rolex' AND wm.name = 'Datejust 41'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- GMT-Master II
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126711CHNR', '''Root Beer'' · steel & Everose', 'high'),
  ('126715CHNR', 'Everose gold · brown-black bezel', 'ultra')
) AS r(ref, var, tier)
WHERE wb.name = 'Rolex' AND wm.name = 'GMT-Master II'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- Submariner
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126619LB', 'Blue dial · white gold', 'ultra')
) AS r(ref, var, tier)
WHERE wb.name = 'Rolex' AND wm.name = 'Submariner'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- Sea-Dweller
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126603', 'Steel & yellow gold · black dial', 'high')
) AS r(ref, var, tier)
WHERE wb.name = 'Rolex' AND wm.name = 'Sea-Dweller'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- Yacht-Master 42 (nowy model)
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('226659', 'Black dial · 18k white gold', 'ultra'),
  ('226658', 'Black dial · 18k yellow gold', 'ultra')
) AS r(ref, var, tier)
WHERE wb.name = 'Rolex' AND wm.name = 'Yacht-Master 42'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- 1908 (nowy model)
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('52508', 'Intense white dial · yellow gold', 'ultra'),
  ('52509', 'Ice-blue dial · platinum', 'ultra')
) AS r(ref, var, tier)
WHERE wb.name = 'Rolex' AND wm.name = '1908'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- ---- TUDOR -----------------------------------------------------------

-- Black Bay 58
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('M79010SG-0001', '925 sterling silver case · taupe dial', 'entry')
) AS r(ref, var, tier)
WHERE wb.name = 'Tudor' AND wm.name = 'Black Bay 58'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- Black Bay 54 (nowy model)
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('M79000N-0001', 'Black dial · 37mm · steel', 'entry')
) AS r(ref, var, tier)
WHERE wb.name = 'Tudor' AND wm.name = 'Black Bay 54'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- Pelagos
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('M25600TB-0001', 'Blue dial · titanium · 42mm', 'entry')
) AS r(ref, var, tier)
WHERE wb.name = 'Tudor' AND wm.name = 'Pelagos'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);

-- ---- AUDEMARS PIGUET -------------------------------------------------

-- Royal Oak
INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('15500ST.OO.1220ST.02', 'Smoked grey dial · 41mm · steel', 'ultra'),
  ('15450ST.OO.1256ST.01', 'Black dial · 37mm · steel', 'ultra')
) AS r(ref, var, tier)
WHERE wb.name = 'Audemars Piguet' AND wm.name = 'Royal Oak'
  AND NOT EXISTS (SELECT 1 FROM watch_references x WHERE x.model_id = wm.id AND x.reference = r.ref);