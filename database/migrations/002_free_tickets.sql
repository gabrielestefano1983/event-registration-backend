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
-- - gratuito=false → Biglietto normale, segue listino prezzi
-- - gratuito=true  → Biglietto gratis, importo_pagato=0, pagato=true
--
-- Quando creare ticket gratuiti:
-- - Amici / Family
-- - Staff / Volontari
-- - Premi / Giveaway
-- - Sponsor VIP
--
-- Backend deve:
-- - Saltare calcolo prezzo se gratuito=true
-- - Impostare importo_pagato=0
-- - Impostare pagato=true (non serve PayPal)
--
-- Frontend deve:
-- - Mostrare "GRATUITO" invece del prezzo
-- - Potrebbe avere checkbox "Registrazione gratuita" (admin only)

-- ================================================
-- END MIGRATION 002
-- ================================================
