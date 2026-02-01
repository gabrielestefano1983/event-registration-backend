-- ================================================
-- MIGRATION 005: Add Event Location Field
-- Created: 2026-02-01
-- Description: Add indirizzo (location) field to eventi table
-- ================================================

-- ================================================
-- 1. ADD INDIRIZZO COLUMN
-- ================================================

ALTER TABLE public.eventi 
ADD COLUMN IF NOT EXISTS indirizzo TEXT;

-- ================================================
-- 2. ADD COMMENT
-- ================================================

COMMENT ON COLUMN public.eventi.indirizzo IS 
'Indirizzo/luogo dell''evento da mostrare nella pagina di registrazione e nelle email';

-- ================================================
-- 3. UPDATE DEFAULT EVENT (Optional)
-- ================================================

-- Aggiorna l'evento default con un indirizzo di esempio
UPDATE public.eventi
SET indirizzo = 'Via Example 123, Milano (MI)'
WHERE id = 1 AND indirizzo IS NULL;

-- ================================================
-- NOTES
-- ================================================

-- Campo opzionale (nullable) per massima flessibilità
-- Se NULL o vuoto, non viene mostrato nelle pagine/email
--
-- Esempio utilizzo:
-- UPDATE eventi SET indirizzo = 'Piazza Duomo 1, Milano' WHERE id = 1;
--
-- Placeholder email disponibile: {{INDIRIZZO_EVENTO}}

-- ================================================
-- END MIGRATION 005
-- ================================================
