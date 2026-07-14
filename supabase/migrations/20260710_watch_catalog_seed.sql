-- 20260710_watch_catalog_seed.sql
-- Seed katalogu: flagowe referencje segmentu 3-50k EUR
-- Wykonane recznie w Supabase SQL Editor 2026-07-10

INSERT INTO watch_brands (name) VALUES
  ('Rolex'),
  ('Omega'),
  ('Audemars Piguet'),
  ('Patek Philippe'),
  ('Jaeger-LeCoultre'),
  ('Tudor'),
  ('Cartier'),
  ('IWC'),
  ('Panerai'),
  ('Vacheron Constantin'),
  ('Grand Seiko'),
  ('Breitling'),
  ('Zenith'),
  ('A. Lange & Söhne'),
  ('Blancpain'),
  ('Hublot');

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Submariner'),
  ('Daytona'),
  ('GMT-Master II'),
  ('Datejust 41'),
  ('Datejust 36'),
  ('Explorer'),
  ('Explorer II'),
  ('Sea-Dweller'),
  ('Deepsea'),
  ('Oyster Perpetual 41'),
  ('Oyster Perpetual 36'),
  ('Air-King'),
  ('Milgauss'),
  ('Yacht-Master 40'),
  ('Day-Date 40'),
  ('Sky-Dweller')
) AS m(name) WHERE watch_brands.name = 'Rolex';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Speedmaster Moonwatch'),
  ('Speedmaster ''57'),
  ('Seamaster Diver 300M'),
  ('Seamaster 300 Heritage'),
  ('Seamaster Planet Ocean'),
  ('Seamaster Aqua Terra'),
  ('Constellation Globemaster'),
  ('De Ville Tresor')
) AS m(name) WHERE watch_brands.name = 'Omega';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Royal Oak'),
  ('Royal Oak Offshore'),
  ('Royal Oak Chronograph'),
  ('Code 11.59')
) AS m(name) WHERE watch_brands.name = 'Audemars Piguet';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Nautilus'),
  ('Aquanaut'),
  ('Calatrava'),
  ('Annual Calendar')
) AS m(name) WHERE watch_brands.name = 'Patek Philippe';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Reverso Classic'),
  ('Reverso Tribute'),
  ('Master Ultra Thin'),
  ('Master Control'),
  ('Polaris')
) AS m(name) WHERE watch_brands.name = 'Jaeger-LeCoultre';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Black Bay 58'),
  ('Black Bay'),
  ('Black Bay GMT'),
  ('Black Bay Chrono'),
  ('Pelagos'),
  ('Royal')
) AS m(name) WHERE watch_brands.name = 'Tudor';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Santos'),
  ('Tank Must'),
  ('Tank Louis'),
  ('Ballon Bleu'),
  ('Pasha')
) AS m(name) WHERE watch_brands.name = 'Cartier';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Portugieser Chronograph'),
  ('Portugieser Automatic'),
  ('Pilot''s Watch Mark XX'),
  ('Big Pilot'),
  ('Pilot Chronograph 41'),
  ('Ingenieur')
) AS m(name) WHERE watch_brands.name = 'IWC';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Luminor Marina'),
  ('Luminor Base'),
  ('Submersible'),
  ('Radiomir')
) AS m(name) WHERE watch_brands.name = 'Panerai';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Overseas'),
  ('Patrimony'),
  ('Traditionnelle'),
  ('Fiftysix')
) AS m(name) WHERE watch_brands.name = 'Vacheron Constantin';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Heritage'),
  ('Elegance'),
  ('Sport'),
  ('Evolution 9')
) AS m(name) WHERE watch_brands.name = 'Grand Seiko';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Navitimer'),
  ('Chronomat'),
  ('Superocean'),
  ('Superocean Heritage'),
  ('Premier')
) AS m(name) WHERE watch_brands.name = 'Breitling';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Chronomaster Sport'),
  ('Chronomaster Original'),
  ('El Primero A384 Revival'),
  ('Defy Skyline')
) AS m(name) WHERE watch_brands.name = 'Zenith';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Saxonia'),
  ('Lange 1'),
  ('1815')
) AS m(name) WHERE watch_brands.name = 'A. Lange & Söhne';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Fifty Fathoms'),
  ('Villeret')
) AS m(name) WHERE watch_brands.name = 'Blancpain';

INSERT INTO watch_models (brand_id, name)
SELECT id, m.name FROM watch_brands, (VALUES
  ('Big Bang'),
  ('Classic Fusion')
) AS m(name) WHERE watch_brands.name = 'Hublot';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126610LN', 'Black dial · steel · date', 'high'),
  ('126610LV', 'Green bezel ''Kermit'' · steel', 'high'),
  ('124060', 'Black dial · steel · no date', 'high'),
  ('126613LB', 'Blue dial · steel & gold', 'high'),
  ('126618LN', 'Black dial · yellow gold', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Submariner';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126500LN', 'White dial ''Panda'' · steel', 'ultra'),
  ('126500LN-BLK', 'Black dial · steel', 'ultra'),
  ('116500LN', 'White dial · steel · previous gen', 'ultra'),
  ('126503', 'Champagne dial · steel & gold', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Daytona';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126710BLRO', '''Pepsi'' bezel · steel · Jubilee', 'high'),
  ('126710BLNR', '''Batman'' bezel · steel', 'high'),
  ('126710GRNR', 'Grey-black bezel · steel', 'high'),
  ('126713GRNR', 'Grey-black bezel · steel & gold', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'GMT-Master II';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126334', 'Blue dial · fluted bezel · Jubilee', 'mid'),
  ('126300', 'Silver dial · smooth bezel', 'mid'),
  ('126331', 'Chocolate dial · Everose & steel', 'high'),
  ('126333', 'Champagne dial · steel & gold', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Datejust 41';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126234', 'Blue dial · fluted bezel', 'mid'),
  ('126200', 'Silver dial · smooth bezel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Datejust 36';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('124270', 'Black dial · 36mm · steel', 'mid'),
  ('224270', 'Black dial · 40mm · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Explorer';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('226570', 'White dial ''Polar'' · steel', 'high'),
  ('226570-BLK', 'Black dial · steel', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Explorer II';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126600', 'Black dial · red line · 43mm', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Sea-Dweller';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('136660', 'D-Blue ''James Cameron'' dial', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Deepsea';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('124300', 'Bright blue dial · steel', 'mid'),
  ('124300-GRN', 'Green dial · steel', 'mid'),
  ('124300-SLV', 'Silver dial · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Oyster Perpetual 41';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126000', 'Bright blue dial · steel', 'entry'),
  ('126000-GRN', 'Green dial · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Oyster Perpetual 36';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126900', 'Black dial · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Air-King';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('116400GV', 'Z-Blue dial · green sapphire', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Milgauss';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('126622', 'Rhodium dial · platinum bezel', 'high'),
  ('126621', 'Chocolate dial · Everose & steel', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Yacht-Master 40';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('228238', 'Champagne dial · yellow gold', 'ultra'),
  ('228239', 'Silver dial · white gold', 'ultra'),
  ('228235', 'Sundust dial · Everose gold', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Day-Date 40';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('336934', 'Blue dial · steel & white gold', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Rolex' AND wm.name = 'Sky-Dweller';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('310.30.42.50.01.001', 'Hesalite · manual · steel', 'entry'),
  ('310.30.42.50.01.002', 'Sapphire sandwich · steel', 'entry'),
  ('310.60.42.50.02.001', 'Silver dial · Canopus gold', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Omega' AND wm.name = 'Speedmaster Moonwatch';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('332.10.41.51.01.001', 'Black dial · coaxial · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Omega' AND wm.name = 'Speedmaster ''57';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('210.30.42.20.01.001', 'Black dial · ceramic · steel', 'entry'),
  ('210.30.42.20.03.001', 'Blue dial · ceramic · steel', 'entry'),
  ('210.30.42.20.04.001', 'White dial · ceramic · steel', 'entry'),
  ('210.22.42.20.01.004', 'Black dial · steel & gold', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Omega' AND wm.name = 'Seamaster Diver 300M';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('234.30.41.21.01.001', 'Black dial · steel · bracelet', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Omega' AND wm.name = 'Seamaster 300 Heritage';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('215.30.44.21.01.001', 'Black dial · 43.5mm · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Omega' AND wm.name = 'Seamaster Planet Ocean';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('220.10.41.21.03.004', 'Blue teak dial · 41mm', 'entry'),
  ('220.10.38.20.03.002', 'Blue teak dial · 38mm', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Omega' AND wm.name = 'Seamaster Aqua Terra';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('130.33.39.21.03.001', 'Blue pie-pan dial · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Omega' AND wm.name = 'Constellation Globemaster';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('435.13.40.21.03.001', 'Blue dial · manual · steel', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Omega' AND wm.name = 'De Ville Tresor';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('15500ST.OO.1220ST.01', 'Black dial · 41mm · steel', 'ultra'),
  ('15500ST.OO.1220ST.03', 'Blue dial · 41mm · steel', 'ultra'),
  ('15510ST.OO.1320ST.04', 'Blue dial · 41mm · 50th anniv.', 'ultra'),
  ('15450ST.OO.1256ST.03', 'Blue dial · 37mm · steel', 'ultra'),
  ('15202ST.OO.1240ST.01', '''Jumbo'' extra-thin · blue dial', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Audemars Piguet' AND wm.name = 'Royal Oak';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('26470ST.OO.A027CA.01', 'Black dial · 42mm · chrono', 'ultra'),
  ('26420SO.OO.A002CA.01', 'Black ceramic bezel · chrono', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Audemars Piguet' AND wm.name = 'Royal Oak Offshore';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('26240ST.OO.1320ST.01', 'Blue dial · 41mm · chrono', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Audemars Piguet' AND wm.name = 'Royal Oak Chronograph';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('15210BC.OO.A321CR.01', 'Blue dial · white gold', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Audemars Piguet' AND wm.name = 'Code 11.59';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('5711/1A-010', 'Blue dial · steel · discontinued', 'ultra'),
  ('5712/1A-001', 'Moonphase · power reserve · steel', 'ultra'),
  ('5726/1A-014', 'Annual calendar · blue dial', 'ultra'),
  ('7118/1A-010', '35.2mm · silvery dial · steel', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Patek Philippe' AND wm.name = 'Nautilus';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('5167A-001', 'Black embossed dial · steel', 'ultra'),
  ('5168G-001', 'Blue dial · 42mm · white gold', 'ultra'),
  ('5267/200A-001', 'Ladies · quartz · steel', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Patek Philippe' AND wm.name = 'Aquanaut';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('5227G-001', 'Ivory dial · officer caseback', 'ultra'),
  ('6119R-001', 'Silvery dial · rose gold', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Patek Philippe' AND wm.name = 'Calatrava';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('5396G-014', 'Silvery opaline dial · white gold', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Patek Philippe' AND wm.name = 'Annual Calendar';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('3858520', 'Medium · small seconds · steel', 'entry'),
  ('3828420', 'Monoface · manual · steel', 'entry'),
  ('3848420', 'Duoface · day-night · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Jaeger-LeCoultre' AND wm.name = 'Reverso Classic';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('Q3978480', 'Duoface · blue dial · steel', 'mid'),
  ('Q713842J', 'Small seconds · burgundy dial', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Jaeger-LeCoultre' AND wm.name = 'Reverso Tribute';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('Q1238420', 'Silver dial · 39mm · steel', 'mid'),
  ('Q1362520', 'Moonphase · silver dial · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Jaeger-LeCoultre' AND wm.name = 'Master Ultra Thin';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('Q4018420', 'Date · silver dial · steel', 'entry'),
  ('Q4128420', 'Chronograph calendar · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Jaeger-LeCoultre' AND wm.name = 'Master Control';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('Q9008180', 'Automatic · black dial · 41mm', 'entry'),
  ('Q9068670', 'Date · blue gradient dial', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Jaeger-LeCoultre' AND wm.name = 'Polaris';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('M79030N-0001', 'Black dial · gilt · steel', 'entry'),
  ('M79030B-0001', 'Navy blue dial · steel', 'entry'),
  ('M79018V-0001', 'Bronze · brown dial', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Tudor' AND wm.name = 'Black Bay 58';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('M7941A1A0RU-0001', 'Burgundy bezel · 41mm · METAS', 'entry'),
  ('M79230N-0009', 'Black bezel · steel', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Tudor' AND wm.name = 'Black Bay';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('M79830RB-0001', '''Pepsi'' bezel · steel', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Tudor' AND wm.name = 'Black Bay GMT';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('M79360N-0001', 'Panda dial · steel', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Tudor' AND wm.name = 'Black Bay Chrono';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('M25600TN-0001', 'Black dial · titanium · 42mm', 'entry'),
  ('M25407N-0001', 'Pelagos 39 · titanium', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Tudor' AND wm.name = 'Pelagos';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('M28600-0005', 'Blue dial · 41mm · steel', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Tudor' AND wm.name = 'Royal';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('WSSA0018', 'Silver dial · large · steel', 'mid'),
  ('WSSA0029', 'Silver dial · medium · steel', 'entry'),
  ('WSSA0037', 'Green dial · large · steel', 'mid'),
  ('W2SA0016', 'Steel & yellow gold · large', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Cartier' AND wm.name = 'Santos';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('WSTA0041', 'Silver dial · large · steel', 'entry'),
  ('WSTA0053', 'Silver dial · extra-large · auto', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Cartier' AND wm.name = 'Tank Must';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('WGTA0011', 'Silver dial · rose gold · large', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Cartier' AND wm.name = 'Tank Louis';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('WSBB0027', 'Silver dial · 40mm · steel', 'entry'),
  ('WSBB0025', 'Silver dial · 42mm · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Cartier' AND wm.name = 'Ballon Bleu';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('WSPA0009', 'Silver dial · 41mm · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Cartier' AND wm.name = 'Pasha';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('IW371606', 'Blue dial · steel · in-house', 'mid'),
  ('IW371604', 'Silver dial · gold hands', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'IWC' AND wm.name = 'Portugieser Chronograph';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('IW500710', 'Silver dial · 7-day reserve', 'high'),
  ('IW358304', 'Blue dial · 40mm · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'IWC' AND wm.name = 'Portugieser Automatic';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('IW328201', 'Black dial · 40mm · steel', 'entry'),
  ('IW328203', 'Blue dial · 40mm · steel', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'IWC' AND wm.name = 'Pilot''s Watch Mark XX';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('IW501001', 'Black dial · 46mm · 7-day', 'high'),
  ('IW329301', '43mm · black dial · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'IWC' AND wm.name = 'Big Pilot';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('IW388101', 'Black dial · steel', 'mid'),
  ('IW388102', 'Blue dial · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'IWC' AND wm.name = 'Pilot Chronograph 41';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('IW328902', 'Aqua dial · 40mm · steel', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'IWC' AND wm.name = 'Ingenieur';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('PAM01312', 'Black dial · 44mm · date', 'entry'),
  ('PAM01313', 'White dial · 44mm · date', 'entry'),
  ('PAM00111', 'Black dial · manual · historic', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Panerai' AND wm.name = 'Luminor Marina';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('PAM01086', 'Black dial · 44mm · logo', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Panerai' AND wm.name = 'Luminor Base';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('PAM01389', 'Black dial · 42mm · steel', 'mid'),
  ('PAM01305', 'Black dial · 47mm · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Panerai' AND wm.name = 'Submersible';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('PAM00992', 'Black dial · 45mm · steel', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Panerai' AND wm.name = 'Radiomir';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('4500V/110A-B128', 'Blue dial · 41mm · steel', 'ultra'),
  ('4500V/110A-B483', 'Silver dial · 41mm · steel', 'ultra'),
  ('2000V/120G-B122', 'Dual time · white gold', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Vacheron Constantin' AND wm.name = 'Overseas';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('85180/000R-9248', 'Silver dial · rose gold · 40mm', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'Vacheron Constantin' AND wm.name = 'Patrimony';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('82172/000R-9382', 'Silver dial · rose gold · manual', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Vacheron Constantin' AND wm.name = 'Traditionnelle';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('4600E/110A-B442', 'Blue dial · steel · 40mm', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Vacheron Constantin' AND wm.name = 'Fiftysix';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('SBGA211', '''Snowflake'' · Spring Drive · Ti', 'entry'),
  ('SBGA413', '''Shunbun'' pink dial · Spring Drive', 'entry'),
  ('SBGH271', 'Hi-Beat · white birch dial', 'mid'),
  ('SLGH005', '''White Birch'' · Hi-Beat 9SA5', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Grand Seiko' AND wm.name = 'Heritage';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('SBGW231', 'Cream dial · manual · steel', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Grand Seiko' AND wm.name = 'Elegance';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('SBGE201', 'GMT · Spring Drive · steel', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Grand Seiko' AND wm.name = 'Sport';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('SLGA009', '''Lake Suwa'' blue · Spring Drive', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Grand Seiko' AND wm.name = 'Evolution 9';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('AB0138211B1P1', 'B01 · 43mm · black dial', 'mid'),
  ('AB0139241C1P1', 'B01 · 46mm · blue dial', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Breitling' AND wm.name = 'Navitimer';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('AB0134101B1A1', 'B01 42 · black dial · rouleaux', 'mid'),
  ('AB0134101C1A1', 'B01 42 · blue dial', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Breitling' AND wm.name = 'Chronomat';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('A17376211B1A1', 'Black dial · 44mm · steel', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Breitling' AND wm.name = 'Superocean';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('AB2010121B1A1', 'B20 · black dial · 42mm', 'entry')
) AS r(ref, var, tier) WHERE wb.name = 'Breitling' AND wm.name = 'Superocean Heritage';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('AB0118221B1P1', 'B01 chrono 42 · black dial', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Breitling' AND wm.name = 'Premier';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('03.3100.3600/69.M3100', 'White dial · steel · 1/10th', 'mid'),
  ('03.3100.3600/21.M3100', 'Black dial · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Zenith' AND wm.name = 'Chronomaster Sport';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('03.3200.3600/69.C902', 'Tri-color dial · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Zenith' AND wm.name = 'Chronomaster Original';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('03.A384.400/21.M384', 'Panda dial · steel · 37mm', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Zenith' AND wm.name = 'El Primero A384 Revival';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('03.9300.3620/01.I001', 'Blue dial · 41mm · steel', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Zenith' AND wm.name = 'Defy Skyline';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('380.033', 'Silver dial · rose gold · thin', 'ultra'),
  ('219.026', 'Silver dial · white gold · manual', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'A. Lange & Söhne' AND wm.name = 'Saxonia';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('191.032', 'Champagne dial · rose gold', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'A. Lange & Söhne' AND wm.name = 'Lange 1';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('235.021', 'Silver dial · yellow gold · manual', 'ultra')
) AS r(ref, var, tier) WHERE wb.name = 'A. Lange & Söhne' AND wm.name = '1815';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('5015-1130-52A', 'Black dial · 45mm · sail-canvas', 'ultra'),
  ('5000-0130-B52A', 'Bathyscaphe · black · 43mm', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Blancpain' AND wm.name = 'Fifty Fathoms';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('6651-1127-55B', 'White dial · ultraplate · steel', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Blancpain' AND wm.name = 'Villeret';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('301.SB.131.RX', 'Black dial · 44mm · ceramic bezel', 'mid'),
  ('441.NX.1171.RX', 'Unico · titanium · 42mm', 'high')
) AS r(ref, var, tier) WHERE wb.name = 'Hublot' AND wm.name = 'Big Bang';

INSERT INTO watch_references (model_id, reference, variant, price_tier)
SELECT wm.id, r.ref, r.var, r.tier FROM watch_models wm
JOIN watch_brands wb ON wb.id = wm.brand_id, (VALUES
  ('511.NX.1171.RX', 'Black dial · titanium · 45mm', 'mid'),
  ('542.NX.7170.RX', 'Blue dial · titanium · 42mm', 'mid')
) AS r(ref, var, tier) WHERE wb.name = 'Hublot' AND wm.name = 'Classic Fusion';

-- Podsumowanie: 16 marek, 82 modeli, 156 referencji