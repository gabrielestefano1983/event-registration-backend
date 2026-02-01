-- ================================================
-- MIGRATION 002: Free Tickets Support
-- Created: 2026-02-01
-- Description: Add gratuito field to mark free tickets for friends/staff
-- ================================================

-- ================================================
-- 1. ADD GRATUITO COLUMN
-- ================================================

ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS gratuito BOOLEAN NOT NULL DEFAULT false;

-- ================================================
-- 2. ADD INDEX FOR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_registrations_gratuito 
ON public.registrations USING btree (gratuito) 
TABLESPACE pg_default;

-- ================================================
-- 3. ADD COMMENT FOR DOCUMENTATION
-- ================================================

COMMENT ON COLUMN public.registrations.gratuito IS 
'Indica se il biglietto è gratuito (per amici, staff, etc). Se true, importo_pagato deve essere 0';

-- ================================================
-- 4. UPDATE VALIDATION (Optional Check Constraint)
-- ================================================

-- Se gratuito=true, l'importo deve essere 0
ALTER TABLE public.registrations
ADD CONSTRAINT check_gratuito_importo 
CHECK (
    (gratuito = false) OR 
    (gratuito = true AND importo_pagato = 0)
);

-- ================================================
-- NOTES
-- ================================================

-- Come funziona:
-- - gratuito=false → Biglietto normale da PayPal
-- - gratuito=true  → Biglietto omaggio inserito MANUALMENTE via SQL
--
-- ⚠️ IMPORTANTE: Il campo gratuito NON è gestito dal backend
--    Tutti i ticket creati via PayPal hanno SEMPRE gratuito=false
--    Solo gli inserimenti MANUALI tramite SQL possono impostare gratuito=true
--
-- Quando creare ticket gratuiti MANUALMENTE:
-- - Amici / Family
-- - Staff / Volontari
-- - Premi / Giveaway
-- - Sponsor VIP
--
-- Esempio inserimento manuale:
-- INSERT INTO registrations (nome, email, telefono, tipo_partecipante,
--     importo_pagato, pagato, qr_token, evento_id, gratuito)
-- VALUES ('Mario Rossi', 'mario@test.com', '123', 'adulto',
--     0.00, true, 'manual-' || gen_random_uuid(), 1, true);
--
-- Email Template:
-- - Il sistema legge il campo gratuito dal database
-- - Se gratuito=true, mostra badge "🎟️ GRATUITO" verde
-- - Se gratuito=false, mostra importo normale

-- ================================================
-- END MIGRATION 002
-- ================================================
