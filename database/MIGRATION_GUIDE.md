# 🚀 Multi-Event Support - Migration Guide

## 📋 Overview

Il sistema ora supporta la gestione di **multipli eventi simultanei** tramite URL parameter (`?event=<eventId>`).

---

## 🔧 Steps di Migrazione

### 1. **Esegui la Migration SQL**

Esegui il file `database/migration_eventi.sql` nell'editor SQL di Supabase:

```bash
# Il file contiene:
1. Creazione tabella eventi
2. Modifica tabella registrations (aggiunta evento_id)
3. Inserimento evento default con ID=1
4. Migrazione dati esistenti → evento ID=1
5. Aggiunta foreign key constraint
```

**Verifica migrazione**:
```sql
SELECT COUNT(*) FROM eventi; -- Dovrebbe essere almeno 1
SELECT COUNT(*) FROM registrations WHERE evento_id IS NOT NULL; -- Tutte le registrazioni
```

---

### 2. **Deploy del Codice**

Fai commit e push delle modifiche:

```bash
git add .
git commit -m "feat: multi-event support with URL parameters"
git push
```

Netlify farà il deploy automatico.

---

### 3. **Crea un Nuovo Evento (Esempio)**

```sql
INSERT INTO eventi (
  nome,
  slug,
  descrizione,
  data_inizio,
  data_fine,
  listino_prezzi,
  tipo_labels,
  email_mittente,
  email_mittente_nome,
  email_oggetto,
  email_body_template,
  attivo
) VALUES (
  'Cena di Beneficenza 2026',
  'cena-beneficenza-2026',
  'Grande cena di raccolta fondi per l''associazione',
  '2026-03-01 18:00:00+00',
  '2026-03-01 23:59:59+00',
  '{"adulto": 15.00, "ragazzo": 8.00, "minore": 0.00}',
  '{"adulto": "Maggiore di 18 anni", "ragazzo": "Tra 12 e 18 anni", "minore": "Minore di 12 anni"}',
  'info@loredoperlavita.it',
  'Loredoperlavita',
  'I tuoi biglietti per Cena di Beneficenza 2026',
  '<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #2c5282; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f7fafc; padding: 15px; text-align: center; font-size: 12px; color: #718096; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{NOME_EVENTO}}</h1>
    </div>
    <div class="content">
        <p>Gentile <strong>{{NOME_PARTECIPANTE}}</strong>,</p>
        <p>Grazie per esserti registrato alla nostra Cena di Beneficenza! Ecco i tuoi biglietti:</p>
        {{TICKETS_HTML}}
        <p>Ti aspettiamo! Conserva questa email e mostra il QR code all''ingresso.</p>
    </div>
    <div class="footer">
        <p>{{NOME_EVENTO}} - {{EMAIL_MITTENTE}}</p>
        <p>Per informazioni: 123-456-7890</p>
    </div>
</body>
</html>',
  true
);
```

**Ottieni l'ID dell'evento**:
```sql
SELECT id, nome FROM eventi WHERE slug = 'cena-beneficenza-2026';
-- Esempio output: id = 2
```

---

## 🌐 Utilizzo

### **URL con EventId (OBBLIGATORIO)**
```
https://tuosito.com/registrazione/registrazione.html?event=2
```

✅ Carica configurazione dall'evento ID=2  
✅ Valida date (bloccato se fuori range)  
✅ Usa prezzi specifici dell'evento  
✅ Invia email con template custom  

> **⚠️ IMPORTANTE**: Il parametro `?event=X` è **obbligatorio**. Senza questo parametro, la pagina mostrerà un messaggio di errore e bloccherà l'accesso al form.

### **Messaggio di Errore**
Se un utente accede senza parametro:
```
https://tuosito.com/registrazione/registrazione.html
```

Vedrà:
```
⚠️ Parametro Mancante

Per accedere alla registrazione è necessario specificare un evento valido.
L'URL deve includere il parametro ?event=ID

Esempio: registrazione.html?event=1
```  

---

## 🎨 Placeholder Email Template

Questi placeholder vengono sostituiti automaticamente nell'email:

| Placeholder | Descrizione | Esempio |
|-------------|-------------|---------|
| `{{NOME_EVENTO}}` | Nome dell'evento | "Cena di Beneficenza 2026" |
| `{{NOME_PARTECIPANTE}}` | Nome del capogruppo | "Mario Rossi" |
| `{{TICKETS_HTML}}` | HTML dei biglietti (generato automaticamente) | `<div>...</div>` |
| `{{EMAIL_MITTENTE}}` | Email mittente | "info@loredoperlavita.it" |
| `{{NUM_BIGLIETTI}}` | Numero di biglietti | "3" |

---

## 🔍 Validazione Evento

Un evento è valido se:
- ✅ `attivo = true`
- ✅ `NOW() >= data_inizio`
- ✅ `NOW() <= data_fine`

### Messaggi di Errore

| Condizione | Messaggio |
|-----------|-----------|
| Evento non trovato | "Evento non trovato" |
| Non attivo | "Evento non attivo" |
| Prima di data_inizio | "L'evento non è ancora iniziato. Disponibile dal DD/MM/YYYY" |
| Dopo data_fine | "L'evento è terminato il DD/MM/YYYY" |

---

## 📊 Verifica Post-Deploy

### 1. **Test Evento Valido**
```
/registrazione/registrazione.html?event=2
```
✅ Dovrebbe caricarsi e mostrare nome evento

### 2. **Test Evento Scaduto**
Crea un evento test con date passate:
```sql
INSERT INTO eventi (..., data_inizio, data_fine, ...)
VALUES (..., '2020-01-01', '2020-01-02', ...);
```
```
/registrazione/registrazione.html?event=<id_evento_test>
```
✅ Dovrebbe mostrare errore "L'evento è terminato"

### 3. **Test Registrazione Completa**
1. Vai su `/registrazione/registrazione.html?event=2`
2. Compila form e completa pagamento (PayPal Sandbox)
3. Verifica email ricevuta con template custom
4. Verifica nel database:
```sql
SELECT * FROM registrations WHERE evento_id = 2 ORDER BY created_at DESC LIMIT 5;
```

---

## 🛠️ Troubleshooting

### Problema: "EventId mancante" su create-order
**Soluzione**: Assicurati che il frontend passi `eventId` nel body

### Problema: Email non usa template custom
**Soluzione**: Verifica che `email_body_template` nel DB non sia NULL

### Problema: Prezzi errati
**Soluzione**: Controlla `listino_prezzi` JSON nel DB evento

---

## 📝 Note

- Le registrazioni esistenti sono state migrate all'evento ID=1
- L'evento default (ID=1) ha date 2024-2030 quindi sempre valido
- Puoi modificare l'evento default o disattivarlo dopo i test

---

**Implementazione completata il**: 2026-02-01  
**Autore**: Antigravity AI Assistant
