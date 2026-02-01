-- ================================================
-- MIGRATION 000: Initial Schema
-- Created: 2026-01-25
-- Description: Base schema for event registration system
-- ================================================

-- ================================================
-- REGISTRATIONS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.registrations (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  tipo_partecipante TEXT NOT NULL,
  importo_pagato NUMERIC(10, 2) DEFAULT 0.00,
  pagato BOOLEAN DEFAULT false,
  paypal_order_id TEXT,
  numero_ordine_gruppo BIGINT,
  qr_token TEXT UNIQUE NOT NULL,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  email_inviata BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT registrations_tipo_partecipante_check CHECK (
    tipo_partecipante = ANY (ARRAY['adulto'::text, 'ragazzo'::text, 'minore'::text])
  )
) TABLESPACE pg_default;

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_registrations_qr_token 
ON public.registrations USING btree (qr_token) 
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_registrations_email 
ON public.registrations USING btree (email) 
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_registrations_paypal_order 
ON public.registrations USING btree (paypal_order_id) 
TABLESPACE pg_default;

-- ================================================
-- TRIGGERS
-- ================================================

-- Function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger on registrations
CREATE TRIGGER update_registrations_updated_at 
BEFORE UPDATE ON registrations 
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- END MIGRATION 000
-- ================================================
