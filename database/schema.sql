-- Schema per il sistema di registrazione eventi
-- Esegui questo script nel SQL Editor di Supabase

-- Creazione tabella registrations
CREATE TABLE IF NOT EXISTS registrations (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  tipo_partecipante TEXT NOT NULL CHECK (tipo_partecipante IN ('adulto', 'ragazzo', 'minore')),
  importo_pagato DECIMAL(10,2) DEFAULT 0.00,
  pagato BOOLEAN DEFAULT false,
  paypal_order_id TEXT,
  numero_ordine_gruppo BIGINT,
  qr_token TEXT UNIQUE NOT NULL,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  email_inviata BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token ON registrations(qr_token);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_paypal_order ON registrations(paypal_order_id);

-- Funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per updated_at
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - IMPORTANTE per sicurezza
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Policy: permettiamo inserimenti solo tramite service role
CREATE POLICY "Enable insert for service role" ON registrations
  FOR INSERT
  WITH CHECK (true);

-- Policy: permettiamo letture solo tramite service role
CREATE POLICY "Enable read for service role" ON registrations
  FOR SELECT
  USING (true);

-- Policy: permettiamo update solo tramite service role
CREATE POLICY "Enable update for service role" ON registrations
  FOR UPDATE
  USING (true);

-- Commenti per documentazione
COMMENT ON TABLE registrations IS 'Tabella principale per le registrazioni agli eventi';
COMMENT ON COLUMN registrations.nome IS 'Nome completo del partecipante';
COMMENT ON COLUMN registrations.email IS 'Email del partecipante (o del capogruppo)';
COMMENT ON COLUMN registrations.telefono IS 'Numero di telefono per contatto (partecipante o capogruppo)';
COMMENT ON COLUMN registrations.tipo_partecipante IS 'Tipo di biglietto: adulto (€10), ragazzo (€5), minore (€0)';
COMMENT ON COLUMN registrations.importo_pagato IS 'Importo effettivo pagato per questo partecipante in EUR';
COMMENT ON COLUMN registrations.pagato IS 'Flag che indica se il pagamento è stato completato';
COMMENT ON COLUMN registrations.paypal_order_id IS 'ID ordine PayPal per tracciabilità';
COMMENT ON COLUMN registrations.numero_ordine_gruppo IS 'Numero progressivo per identificare i partecipanti dello stesso gruppo/ordine';
COMMENT ON COLUMN registrations.qr_token IS 'Token univoco generato per il QR code del biglietto';
COMMENT ON COLUMN registrations.checked_in IS 'Flag che indica se il partecipante ha fatto check-in all''evento';
COMMENT ON COLUMN registrations.checked_in_at IS 'Timestamp esatto del momento del check-in';
COMMENT ON COLUMN registrations.email_inviata IS 'Flag che indica se l''email con il biglietto è stata inviata con successo';
COMMENT ON COLUMN registrations.note IS 'Note aggiuntive (allergie, esigenze speciali, note staff)';
