# 📊 Query SQL Utili - Event Registration System

Collezione di query SQL pronte all'uso per gestire il sistema di registrazione eventi.

---

## 🎫 Gestione Ticket

### Creare Ticket Gratuito Manualmente
```sql
INSERT INTO registrations (
    nome, email, telefono, tipo_partecipante,
    importo_pagato, pagato, qr_token, evento_id, gratuito
) VALUES (
    'Mario Rossi',
    'mario@example.com', 
    '1234567890',
    'adulto',
    0.00,
    true,
    'manual-' || gen_random_uuid()::text,
    1,  -- ID evento
    true
);
```

### Lista Tutti i Ticket di un Evento
```sql
SELECT 
    id,
    nome,
    email,
    tipo_partecipante,
    importo_pagato,
    pagato,
    checked_in,
    gratuito,
    created_at
FROM registrations
WHERE evento_id = 1
ORDER BY created_at DESC;
```

### Ticket Ancora da Check-in
```sql
SELECT 
    nome,
    email,
    tipo_partecipante,
    qr_token
FROM registrations
WHERE evento_id = 1 
AND checked_in = false
ORDER BY created_at DESC;
```

---

## 💰 Statistiche Finanziarie

### Entrate per Evento
```sql
SELECT 
    e.nome as evento,
    COUNT(*) as totale_ticket,
    COUNT(CASE WHEN r.gratuito = false THEN 1 END) as ticket_pagati,
    COUNT(CASE WHEN r.gratuito = true THEN 1 END) as ticket_gratuiti,
    SUM(CASE WHEN r.gratuito = false THEN r.importo_pagato ELSE 0 END) as totale_incassato
FROM registrations r
JOIN eventi e ON r.evento_id = e.id
GROUP BY e.id, e.nome
ORDER BY e.data_inizio DESC;
```

### Dettaglio Entrate per Tipo
```sql
SELECT 
    tipo_partecipante,
    COUNT(*) as numero_ticket,
    SUM(importo_pagato) as totale_importo,
    AVG(importo_pagato) as media_importo
FROM registrations
WHERE evento_id = 1
AND gratuito = false
GROUP BY tipo_partecipante
ORDER BY totale_importo DESC;
```

### Gruppi PayPal più Grandi
```sql
SELECT 
    numero_ordine_gruppo,
    COUNT(*) as persone_nel_gruppo,
    SUM(importo_pagato) as totale_gruppo,
    MIN(created_at) as data_registrazione
FROM registrations
WHERE evento_id = 1
AND numero_ordine_gruppo IS NOT NULL
GROUP BY numero_ordine_gruppo
ORDER BY persone_nel_gruppo DESC
LIMIT 10;
```

---

## 📧 Email e Comunicazioni

### Ticket Senza Email Inviata
```sql
SELECT 
    id,
    nome,
    email,
    created_at
FROM registrations
WHERE evento_id = 1
AND email_inviata = false
ORDER BY created_at;
```

### Riinviare Email a un Partecipante
```sql
-- Prima segna come non inviata
UPDATE registrations 
SET email_inviata = false
WHERE email = 'mario@example.com'
AND evento_id = 1;

-- Poi triggera il re-invio (da implementare se serve)
```

---

## 🎟️ Check-in Management

### Statistiche Check-in
```sql
SELECT 
    COUNT(*) as totale_ticket,
    COUNT(CASE WHEN checked_in = true THEN 1 END) as checked_in,
    COUNT(CASE WHEN checked_in = false THEN 1 END) as non_checked_in,
    ROUND(100.0 * COUNT(CASE WHEN checked_in = true THEN 1 END) / COUNT(*), 2) as percentuale_checkin
FROM registrations
WHERE evento_id = 1;
```

### Ultimi Check-in
```sql
SELECT 
    nome,
    tipo_partecipante,
    checked_in_at
FROM registrations
WHERE evento_id = 1
AND checked_in = true
ORDER BY checked_in_at DESC
LIMIT 20;
```

### Check-in per Ora
```sql
SELECT 
    DATE_TRUNC('hour', checked_in_at) as ora,
    COUNT(*) as numero_checkin
FROM registrations
WHERE evento_id = 1
AND checked_in = true
GROUP BY DATE_TRUNC('hour', checked_in_at)
ORDER BY ora;
```

---

## 🎪 Gestione Eventi

### Lista Eventi Attivi
```sql
SELECT 
    id,
    nome,
    data_ora_evento,
    attivo,
    (SELECT COUNT(*) FROM registrations WHERE evento_id = eventi.id) as totale_registrazioni
FROM eventi
WHERE attivo = true
ORDER BY data_ora_evento;
```

### Disattiva Manualmente un Evento
```sql
UPDATE eventi
SET attivo = false
WHERE id = 1
RETURNING id, nome, data_ora_evento;
```

### Clonare un Evento
```sql
INSERT INTO eventi (
    nome, slug, descrizione, 
    data_ora_evento,
    listino_prezzi, tipo_labels,
    email_mittente, email_mittente_nome,
    email_oggetto, email_body_template,
    attivo
)
SELECT 
    nome || ' - Copia',
    slug || '-copy',
    descrizione,
    '2026-06-15 19:00:00+00',  -- Nuova data e ora
    listino_prezzi,
    tipo_labels,
    email_mittente,
    email_mittente_nome,
    email_oggetto,
    email_body_template,
    false  -- Disattivato finché non configuri
FROM eventi
WHERE id = 1;
```

---

## 🔍 Debug e Manutenzione

### Trovare Duplicati per Email
```sql
SELECT 
    email,
    COUNT(*) as numero_registrazioni,
    STRING_AGG(nome, ', ') as nomi
FROM registrations
WHERE evento_id = 1
GROUP BY email
HAVING COUNT(*) > 1;
```

### Registrazioni Senza QR Code
```sql
SELECT 
    id,
    nome,
    email,
    qr_token
FROM registrations
WHERE evento_id = 1
AND (qr_token IS NULL OR qr_token = '');
```

### Ordini PayPal Incompleti
```sql
SELECT 
    paypal_order_id,
    COUNT(*) as partecipanti,
    SUM(importo_pagato) as totale,
    MAX(created_at) as ultima_modifica
FROM registrations
WHERE evento_id = 1
AND paypal_order_id IS NOT NULL
AND pagato = false
GROUP BY paypal_order_id;
```

---

## 📊 Report Completo Evento

### Super Query - Report Completo
```sql
WITH stats AS (
    SELECT 
        COUNT(*) as totale_ticket,
        COUNT(CASE WHEN gratuito = false THEN 1 END) as ticket_pagati,
        COUNT(CASE WHEN gratuito = true THEN 1 END) as ticket_gratuiti,
        SUM(importo_pagato) as incasso_totale,
        COUNT(CASE WHEN checked_in = true THEN 1 END) as checkin_effettuati,
        COUNT(DISTINCT numero_ordine_gruppo) as gruppi_paypal
    FROM registrations
    WHERE evento_id = 1
),
tipo_breakdown AS (
    SELECT 
        tipo_partecipante,
        COUNT(*) as count,
        SUM(importo_pagato) as incasso
    FROM registrations
    WHERE evento_id = 1
    GROUP BY tipo_partecipante
)
SELECT 
    e.nome as evento,
    e.data_ora_evento,
    s.totale_ticket,
    s.ticket_pagati,
    s.ticket_gratuiti,
    s.incasso_totale,
    s.checkin_effettuati,
    ROUND(100.0 * s.checkin_effettuati / s.totale_ticket, 2) as percentuale_checkin,
    s.gruppi_paypal,
    (SELECT json_agg(json_build_object('tipo', tipo_partecipante, 'count', count, 'incasso', incasso))
     FROM tipo_breakdown) as dettaglio_per_tipo
FROM eventi e
CROSS JOIN stats s
WHERE e.id = 1;
```

---

## 🛠️ Utility

### Resetta Check-in (Per Test)
```sql
UPDATE registrations
SET checked_in = false,
    checked_in_at = NULL
WHERE evento_id = 1;
```

### Elimina Registrazione di Test
```sql
DELETE FROM registrations
WHERE evento_id = 1
AND email LIKE '%@test.com';
```

### Aggiorna Email Template di un Evento
```sql
UPDATE eventi
SET email_body_template = '
<html>
<body>
    <h1>{{NOME_EVENTO}}</h1>
    <p>Ciao {{NOME_PARTECIPANTE}}!</p>
    {{TICKETS_HTML}}
</body>
</html>
'
WHERE id = 1;
```

---

**Salva queste query** - sono pronte per l'uso in Supabase SQL Editor! 🚀
