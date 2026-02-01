# 📁 Database Migrations

Questo folder contiene tutte le migrazioni del database in ordine cronologico.

## 🔢 Convenzione di Naming

Le migrazioni seguono il formato:
```
XXX_description.sql
```

Dove:
- `XXX` = Numero progressivo a 3 cifre (000, 001, 002, ...)
- `description` = Descrizione breve in snake_case

## 📋 Elenco Migrazioni

### `000_init.sql`
**Data**: 2026-01-25  
**Stato**: ✅ Applicata  
**Descrizione**: Schema iniziale del sistema
- Tabella `registrations`
- Indici base
- Trigger `update_updated_at`

### `001_multi_event_support.sql`
**Data**: 2026-02-01  
**Stato**: ✅ Applicata  
**Descrizione**: Supporto multi-evento
- Tabella `eventi`
- Foreign key `evento_id` in `registrations`
- Migrazione dati esistenti a evento ID=1
- Email template system

### `002_free_tickets.sql`
**Data**: 2026-02-01  
**Stato**: ⏳ Da applicare  
**Descrizione**: Ticket gratuiti
- Campo `gratuito` boolean in `registrations`
- Constraint validazione importo
- Indice per performance

### `003_simplify_event_dates.sql`
**Data**: 2026-02-01  
**Stato**: ⏳ Da applicare  
**Descrizione**: Semplifica gestione date
- Elimina `data_inizio` e `data_fine`
- Aggiunge `data_ora_evento` (timestamp singolo)
- Validazione eventi ora basata solo su `attivo`
- Data/ora mostrata nella pagina di registrazione

### `004_update_email_template.sql`
**Data**: 2026-02-01  
**Stato**: ⏳ Da applicare  
**Descrizione**: Aggiorna template email
- Aggiunge `{{DATA_ORA_EVENTO}}` al template
- Design migliorato con data in evidenza
- Mostra numero biglietti

### `005_add_event_location.sql`
**Data**: 2026-02-01  
**Stato**: ⏳ Da applicare  
**Descrizione**: Aggiunge campo indirizzo
- Campo `indirizzo` TEXT in tabella `eventi`
- Mostrato in pagine registrazione
- Placeholder `{{INDIRIZZO_EVENTO}}` per email

### `006_update_email_template.sql`
**Data**: 2026-02-01  
**Stato**: ⏳ Da applicare  
**Descrizione**: Finalizza template email
- Aggiorna il template includendo sia DATA_ORA che INDIRIZZO
- Migliora layout header con badge

## 🚀 Come Applicare Migrazioni

### In Ordine (Prima Installazione)
```sql
-- 1. Esegui in ordine
\i 000_init.sql
\i 001_multi_event_support.sql
\i 002_free_tickets.sql
```

### Singola Migrazione
```sql
-- Copia e incolla in Supabase SQL Editor
-- Solo se non già applicata!
```

## ⚠️ Regole Importanti

1. **Mai modificare** migrazioni già applicate
2. **Mai eliminare** migrazioni vecchie
3. **Sempre aggiungere** nuove migrazioni con numero successivo
4. **Testare** prima su ambiente di sviluppo
5. **Documentare** ogni modifica in questo README

## 🔍 Verificare Stato Migrazioni

```sql
-- Verifica tabelle esistenti
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verifica campo gratuito
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'registrations' 
AND column_name = 'gratuito';
```

## 📝 Template per Nuova Migrazione

```sql
-- ================================================
-- MIGRATION XXX: [Titolo]
-- Created: YYYY-MM-DD
-- Description: [Descrizione dettagliata]
-- ================================================

-- [SQL Code]

-- ================================================
-- END MIGRATION XXX
-- ================================================
```

---

**Ultima Migrazione**: 006  
**Prossima Disponibile**: 007
