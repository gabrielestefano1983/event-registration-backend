-- ================================================
-- MIGRATION 003: Simplify Event Date Schema
-- Created: 2026-02-01
-- Description: Replace data_inizio/data_fine with single data_ora_evento
-- ================================================

-- ================================================
-- 1. ADD NEW COLUMN
-- ================================================

ALTER TABLE public.eventi 
ADD COLUMN IF NOT EXISTS data_ora_evento TIMESTAMP WITH TIME ZONE;

-- ================================================
-- 2. MIGRATE EXISTING DATA
-- ================================================

-- Copia data_inizio come data_ora_evento per eventi esistenti
UPDATE public.eventi
SET data_ora_evento = data_inizio
WHERE data_ora_evento IS NULL;

-- ================================================
-- 3. MAKE COLUMN NOT NULL
-- ================================================

ALTER TABLE public.eventi
ALTER COLUMN data_ora_evento SET NOT NULL;

-- ================================================
-- 4. DROP OLD COLUMNS
-- ================================================

ALTER TABLE public.eventi
DROP COLUMN IF EXISTS data_inizio,
DROP COLUMN IF EXISTS data_fine;

-- ================================================
-- 5. ADD COMMENT
-- ================================================

COMMENT ON COLUMN public.eventi.data_ora_evento IS 
'Data e ora dell''evento da mostrare nella pagina di registrazione';

-- ================================================
-- NOTES
-- ================================================

-- Cambio di logica:
-- - PRIMA: Evento valido se NOW() tra data_inizio e data_fine
-- - ORA: Evento valido se attivo = true (nessun controllo date)
--
-- La data_ora_evento è solo INFORMATIVA per l'utente
-- Non viene usata per validazione
--
-- Esempio:
-- data_ora_evento = '2026-06-15 19:00:00+00'
-- → Mostrato come: "15/06/2026 alle 19:00"

-- ================================================
-- END MIGRATION 003
-- ================================================
