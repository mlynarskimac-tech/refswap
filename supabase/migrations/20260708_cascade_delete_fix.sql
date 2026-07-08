-- ============================================================
-- RefSwap — migracja #2: naprawa kaskadowego usuwania kont
-- Wykonana ręcznie w Supabase SQL Editor 2026-07-08
-- Problem: messages.sender_id i reports.reporter_id miały ON DELETE NO ACTION,
-- co blokowało usunięcie konta, które kiedykolwiek wysłało wiadomość lub zgłoszenie.
-- ============================================================

ALTER TABLE messages DROP CONSTRAINT messages_sender_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE reports DROP CONSTRAINT reports_reporter_id_fkey;
ALTER TABLE reports ADD CONSTRAINT reports_reporter_id_fkey
  FOREIGN KEY (reporter_id) REFERENCES profiles(id) ON DELETE CASCADE;
