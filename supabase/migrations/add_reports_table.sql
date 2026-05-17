CREATE TABLE reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid REFERENCES profiles(id),
  reported_listing_id uuid,
  reported_user_id uuid,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Zalogowany użytkownik może dodać zgłoszenie
CREATE POLICY "Authenticated users can insert reports" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Brak polityki SELECT = nikt nie może czytać; admin weryfikuje przez Supabase dashboard
