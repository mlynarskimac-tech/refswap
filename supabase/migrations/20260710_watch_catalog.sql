-- 20260710_watch_catalog.sql
-- Katalog zegarków: brand → model → reference
-- Wykonane ręcznie w Supabase SQL Editor 2026-07-10

-- 1. Marki
CREATE TABLE watch_brands (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Modele (należą do marki)
CREATE TABLE watch_models (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id   uuid NOT NULL REFERENCES watch_brands(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, name)
);

-- 3. Referencje (należą do modelu)
CREATE TABLE watch_references (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id   uuid NOT NULL REFERENCES watch_models(id) ON DELETE CASCADE,
  reference  text NOT NULL,
  variant    text,
  price_tier text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (model_id, reference)
);

-- 4. Indeksy na kluczach obcych
CREATE INDEX idx_watch_models_brand ON watch_models(brand_id);
CREATE INDEX idx_watch_references_model ON watch_references(model_id);

-- 5. Podpięcie oferty do referencji (nullable — wpis ręczny nie ma reference_id)
ALTER TABLE listings ADD COLUMN reference_id uuid REFERENCES watch_references(id);

-- 6. RLS: katalog czytelny dla zalogowanych, zapis tylko przez SQL Editor (admin)
ALTER TABLE watch_brands     ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_models     ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog readable" ON watch_brands
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Catalog readable" ON watch_models
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Catalog readable" ON watch_references
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON watch_brands, watch_models, watch_references TO authenticated;