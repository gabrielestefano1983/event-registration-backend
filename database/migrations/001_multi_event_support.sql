-- Migration: Add Multi-Event Support
-- Creato: 2026-02-01
-- Descrizione: Aggiunge tabella eventi e supporto multi-evento

-- ================================================
-- 1. CREAZIONE TABELLA EVENTI
-- ================================================

CREATE TABLE IF NOT EXISTS public.eventi (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT UNIQUE,
  descrizione TEXT,
  
  -- Date validità evento
  data_inizio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fine TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Configurazione prezzi (JSON)
  listino_prezzi JSONB NOT NULL DEFAULT '{"adulto": 10.00, "ragazzo": 5.00, "minore": 0.00}',
  tipo_labels JSONB NOT NULL DEFAULT '{"adulto": "Maggiore di 18 anni", "ragazzo": "Tra 12 e 18 anni", "minore": "Minore di 12 anni"}',
  
  -- Configurazione email
  email_mittente TEXT NOT NULL DEFAULT 'info@loredoperlavita.it',
  email_mittente_nome TEXT NOT NULL DEFAULT 'Loredoperlavita',
  email_oggetto TEXT NOT NULL DEFAULT 'I tuoi biglietti per l''evento',
  email_body_template TEXT NOT NULL,
  
  -- Stato
  attivo BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (data_fine > data_inizio)
) TABLESPACE pg_default;

-- ================================================
-- 2. MODIFICA TABELLA REGISTRATIONS
-- ================================================

-- Aggiungi colonna evento_id (nullable inizialmente per migrazione)
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS evento_id BIGINT;

-- Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_registrations_evento_id 
ON public.registrations USING btree (evento_id) 
TABLESPACE pg_default;

-- ================================================
-- 3. INSERIMENTO EVENTO DEFAULT
-- ================================================

-- Inserisci un evento di default per le registrazioni esistenti
INSERT INTO public.eventi (
  id,
  nome,
  slug,
  descrizione,
  data_inizio,
  data_fine,
  email_body_template,
  attivo
) VALUES (
  1,
  'Evento Default',
  'evento-default',
  'Evento di default per migrazione registrazioni esistenti',
  '2024-01-01 00:00:00+00',
  '2030-12-31 23:59:59+00',
  '<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #3182ce; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f7fafc; padding: 15px; text-align: center; font-size: 12px; color: #718096; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{NOME_EVENTO}}</h1>
    </div>
    <div class="content">
        <p>Ciao <strong>{{NOME_PARTECIPANTE}}</strong>,</p>
        <p>Grazie per la tua registrazione! Ecco i tuoi biglietti:</p>
        {{TICKETS_HTML}}
        <p>Conserva questa email e mostra il QR code all''ingresso.</p>
    </div>
    <div class="footer">
        <p>{{NOME_EVENTO}} - {{EMAIL_MITTENTE}}</p>
    </div>
</body>
</html>',
  true
) ON CONFLICT (id) DO NOTHING;

-- ================================================
-- 4. MIGRAZIONE DATI ESISTENTI
-- ================================================

-- Assegna tutte le registrazioni esistenti all'evento 1
UPDATE public.registrations 
SET evento_id = 1 
WHERE evento_id IS NULL;

-- ================================================
-- 5. AGGIUNGI FOREIGN KEY CONSTRAINT
-- ================================================

-- Ora che tutti i record hanno un evento_id, aggiungiamo la constraint
ALTER TABLE public.registrations
ADD CONSTRAINT fk_registrations_evento
FOREIGN KEY (evento_id) 
REFERENCES public.eventi(id) 
ON DELETE RESTRICT;

-- Rendi la colonna NOT NULL
ALTER TABLE public.registrations
ALTER COLUMN evento_id SET NOT NULL;

-- ================================================
-- 6. TRIGGER PER UPDATE TIMESTAMP
-- ================================================

-- Riusa la funzione esistente per updated_at
CREATE TRIGGER update_eventi_updated_at 
BEFORE UPDATE ON public.eventi 
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- FINE MIGRATION
-- ================================================

-- Verifica
-- SELECT COUNT(*) FROM eventi;
-- SELECT COUNT(*) FROM registrations WHERE evento_id IS NOT NULL;
