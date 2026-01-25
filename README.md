# 🎟️ Event Registration Backend

Sistema completo di registrazione eventi con pagamenti PayPal, generazione QR codes e gestione check-in.

## 📋 Features

- ✅ **Registrazione multi-partecipante** - Un capogruppo può registrare più persone
- 💳 **Pagamenti PayPal** - Integrazione completa con PayPal Checkout API
- 📧 **Email automatiche** - Invio biglietti con QR code via Resend
- 🔐 **QR Code univoci** - Generati automaticamente per ogni partecipante
- ✅ **Sistema check-in** - Validazione QR code all'ingresso evento
- 📊 **Database Supabase** - Storico completo registrazioni e pagamenti

## 🛠️ Tecnologie

### Backend
- **Netlify Functions** - Serverless functions (Node.js)
- **Supabase** - Database PostgreSQL
- **PayPal API** - Gestione pagamenti
- **Resend** - Invio email transazionali
- **QRCode** - Generazione QR codes

### Frontend
- **HTML/JavaScript** - Form registrazione
- **PayPal SDK** - Integrazione checkout

## 🚀 Setup Locale

### Prerequisiti

- Node.js 18+
- Account Supabase
- Account PayPal Developer (Sandbox)
- Account Resend
- Netlify CLI

### Installazione

```bash
# Clona il repository
git clone https://github.com/gabrielestefano1983/event-registration-backend.git
cd event-registration-backend

# Installa dipendenze
npm install

# Installa Netlify CLI
npm install netlify-cli -g

# Login Netlify
netlify login
```

### Configurazione

1. **Crea file `.env` nella root:**

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
RESEND_API_KEY=your_resend_api_key
```

2. **Setup Database Supabase:**

Esegui lo schema SQL:
```bash
# Copia il contenuto di database/schema.sql
# Esegui nel SQL Editor di Supabase
```

3. **Avvia server locale:**

```bash
netlify dev
```

Il server sarà disponibile su `http://localhost:8888`

## 📂 Struttura Progetto

```
event-registration-backend/
├── database/
│   └── schema.sql                    # Schema database Supabase
├── netlify/
│   └── functions/
│       ├── utils/
│       │   └── supabase.js           # Client Supabase condiviso
│       ├── config.js                 # Configurazione pubblica (PayPal Client ID)
│       ├── create-order.js           # Creazione ordine PayPal
│       ├── capture-order.js          # Cattura pagamento + email + QR
│       ├── checkin.js                # Validazione QR all'ingresso
│       └── test.js                   # Test connessione
├── registrazione/
│   └── registrazione.html            # Form registrazione frontend
├── .env                               # Variabili d'ambiente (non committato)
├── .gitignore
├── netlify.toml                       # Configurazione Netlify
├── package.json
└── README.md
```

## 🔌 API Endpoints

### `GET /api/test`
Test connessione backend
```json
{ "message": "Il backend è vivo!" }
```

### `GET /api/config`
Ottieni configurazione pubblica
```json
{
  "paypalClientId": "xxx",
  "currency": "EUR"
}
```

### `POST /api/create-order`
Crea ordine PayPal

**Request:**
```json
{
  "participants": [
    {
      "nome": "Mario Rossi",
      "email": "mario@test.it",
      "telefono": "+39 123 456789",
      "tipo": "adulto",
      "note": ""
    }
  ]
}
```

**Response:**
```json
{ "id": "PAYPAL_ORDER_ID" }
```

### `POST /api/capture-order`
Cattura pagamento, salva DB, invia email

**Request:**
```json
{
  "orderID": "PAYPAL_ORDER_ID",
  "participants": [...]
}
```

**Response:**
```json
{ "status": "ok" }
```

### `POST /api/checkin`
Valida QR code all'ingresso

**Request:**
```json
{ "qr_token": "abc123xyz" }
```

**Response:**
```json
{
  "message": "Benvenuto/a Mario Rossi!",
  "tipo": "adulto"
}
```

## 💰 Prezzi Biglietti

| Tipo | Età | Prezzo |
|------|-----|--------|
| Adulto | 18+ | €10.00 |
| Ragazzo | 12-18 | €5.00 |
| Minore | <12 | Gratis |

⚠️ Il capogruppo paga sempre come adulto (€10) - forzato server-side per sicurezza.

## 🚀 Deploy su Netlify

### 1. Collega GitHub

Il repository è già collegato a Netlify. Ogni push su `main` triggera un deploy automatico.

### 2. Configura Environment Variables

Vai su Netlify Dashboard → Site Settings → Environment Variables

Aggiungi:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`
- `RESEND_API_KEY`

### 3. Deploy

```bash
git push origin main
```

Il deploy parte automaticamente. URL: `https://event-registration-backend.netlify.app`

## 🧪 Test

### Test Locale

1. Avvia: `netlify dev`
2. Apri: `http://localhost:8888/registrazione/registrazione.html`
3. Compila form e usa PayPal Sandbox per testare

### Test Produzione

1. Apri: `https://event-registration-backend.netlify.app/registrazione/registrazione.html`
2. Usa account PayPal Sandbox da [developer.paypal.com](https://developer.paypal.com)

## 📊 Database Schema

Tabella `registrations`:

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | BIGSERIAL | Primary key |
| nome | TEXT | Nome partecipante |
| email | TEXT | Email |
| telefono | TEXT | Telefono (obbligatorio) |
| tipo_partecipante | TEXT | adulto/ragazzo/minore |
| importo_pagato | DECIMAL | Importo pagato |
| pagato | BOOLEAN | Stato pagamento |
| paypal_order_id | TEXT | ID PayPal |
| numero_ordine_gruppo | INTEGER | ID gruppo |
| qr_token | TEXT | Token QR univoco |
| checked_in | BOOLEAN | Flag check-in |
| checked_in_at | TIMESTAMP | Timestamp check-in |
| email_inviata | BOOLEAN | Flag email inviata |
| note | TEXT | Note partecipante |
| created_at | TIMESTAMP | Data creazione |
| updated_at | TIMESTAMP | Data aggiornamento |

## 🔒 Sicurezza

- ✅ File `.env` escluso da Git (in `.gitignore`)
- ✅ Secrets solo lato server (Netlify Functions)
- ✅ PayPal Secret mai esposto al client
- ✅ Validazione server-side per prezzi
- ✅ Row Level Security (RLS) su Supabase

## 📝 License

MIT

## 👤 Author

Gabriele Stefano
- GitHub: [@gabrielestefano1983](https://github.com/gabrielestefano1983)

## 🤝 Support

Per problemi o domande, apri una [issue](https://github.com/gabrielestefano1983/event-registration-backend/issues).