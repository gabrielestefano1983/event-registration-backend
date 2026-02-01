# 🎟️ Free Tickets Feature

## Overview

Il sistema ora supporta **ticket gratuiti** tramite il campo `gratuito` nella tabella `registrations`.

---

## 📋 Casi d'Uso

I ticket gratuiti sono ideali per:
- 👥 **Amici e Family**
- 🎭 **Staff e Volontari**
- 🏆 **Premi e Giveaway**
- 💼 **Sponsor VIP**
- 🎁 **Omaggi promozionali**

---

## 🗄️ Database

### Campo Aggiunto
```sql
ALTER TABLE registrations 
ADD COLUMN gratuito BOOLEAN NOT NULL DEFAULT false;
```

### Constraint di Validazione
```sql
-- Se gratuito=true, importo_pagato DEVE essere 0
ALTER TABLE registrations
ADD CONSTRAINT check_gratuito_importo 
CHECK (
    (gratuito = false) OR 
    (gratuito = true AND importo_pagato = 0)
);
```

---

## 🔧 Come Funziona

### Backend (capture-order.js)

```javascript
const isGratuito = p.gratuito === true;

await supabase.from('registrations').insert([{
    nome: p.nome,
    importo_pagato: isGratuito ? 0.00 : importo,
    pagato: true,
    gratuito: isGratuito
    // ... altri campi
}]);
```

### Email Template

I ticket gratuiti mostrano **"🎟️ GRATUITO"** in verde invece del prezzo:

```html
<!-- Ticket normale -->
<p><strong>Importo:</strong> €15.00</p>

<!-- Ticket gratuito -->
<p style="color: #48bb78; font-weight: bold;">
    <strong>🎟️ GRATUITO</strong>
</p>
```

---

## 📝 Esempi

### Creare un Ticket Gratuito (SQL)

```sql
INSERT INTO registrations (
    nome,
    email,
    telefono,
    tipo_partecipante,
    importo_pagato,
    pagato,
    numero_ordine_gruppo,
    qr_token,
    evento_id,
    gratuito
) VALUES (
    'Mario Rossi',
    'mario@example.com',
    '1234567890',
    'adulto',
    0.00,
    true,
    0,
    generate_random_token(),
    1,
    true  -- ← TICKET GRATUITO
);
```

### Via API (Payload)

Quando invii partecipanti all'API, aggiungi `gratuito: true`:

```json
{
  "eventId": 1,
  "participants": [
    {
      "nome": "Mario Rossi",
      "email": "mario@example.com",
      "tipo": "adulto",
      "gratuito": true  // ← TICKET GRATUITO
    }
  ]
}
```

---

## ✅ Validazione

### Regole Backend:
- ✅ Se `gratuito=true` → `importo_pagato=0`
- ✅ Se `gratuito=false` → `importo_pagato` da listino
- ✅ Tutti i ticket sono salvati con `pagato=true`

### Regole Database:
- ✅ Constraint impedisce `gratuito=true` con `importo_pagato > 0`

---

## 🎨 Output Email

### Ticket Normale:
```
┌─────────────────────────────┐
│ Mario Rossi                 │
│ Tipo: Maggiore di 18 anni   │
│ Importo: €15.00             │
│ [QR CODE]                   │
└─────────────────────────────┘
```

### Ticket Gratuito:
```
┌─────────────────────────────┐
│ Luigi Bianchi               │
│ Tipo: Maggiore di 18 anni   │
│ 🎟️ GRATUITO                 │
│ [QR CODE]                   │
└─────────────────────────────┘
```

---

## 🔍 Query Utili

### Conta Ticket Gratuiti per Evento
```sql
SELECT 
    evento_id,
    COUNT(*) as ticket_gratuiti
FROM registrations 
WHERE gratuito = true
GROUP BY evento_id;
```

### Lista Ticket Gratuiti
```sql
SELECT 
    nome,
    email,
    tipo_partecipante,
    created_at
FROM registrations 
WHERE gratuito = true 
AND evento_id = 1
ORDER BY created_at DESC;
```

### Statistiche Entrate
```sql
SELECT 
    evento_id,
    SUM(CASE WHEN gratuito = false THEN importo_pagato ELSE 0 END) as entrate_pagate,
    COUNT(CASE WHEN gratuito = true THEN 1 END) as ticket_gratuiti,
    COUNT(*) as totale_ticket
FROM registrations
GROUP BY evento_id;
```

---

## ⚠️ Note Importanti

1. **PayPal non coinvolto**: I ticket gratuiti bypassano PayPal completamente
2. **QR Code generato**: Ogni ticket gratuito ha un QR code valido
3. **Email inviata**: L'email di conferma viene inviata normalmente
4. **Check-in uguale**: Il processo di check-in è identico per tutti i ticket

---

**Creato**: 2026-02-01  
**Migration**: 002_free_tickets.sql
