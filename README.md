# 🎟️ Event Registration Backend

Sistema completo di registrazione eventi con pagamenti PayPal, generazione QR codes e gestione check-in.
Progetto **Open Source / Non-Profit** per eventi di beneficenza.

## 📋 Features

- ✅ **Registrazione multi-partecipante** - Un capogruppo può registrare più persone
- 💳 **Pagamenti PayPal** - Integrazione completa con PayPal Checkout API
- 📧 **Email automatiche** - Invio biglietti aggregati in un'unica email tramite Resend
- 🏎️ **Performance** - Processamento parallelo ordini per feedback istantaneo
- 🔐 **QR Code univoci** - Generati automaticamente e hostati su Supabase Storage
- ✅ **Sistema check-in** - Web app per scannerizzare QR code all'ingresso
- 📊 **Database Supabase** - Storico completo registrazioni e pagamenti

## 🛠️ Tecnologie

### Backend
- **Netlify Functions** - Serverless functions (Node.js)
- **Supabase** - Database PostgreSQL & Storage
- **PayPal API** - Gestione pagamenti sicuri
- **Resend** - Invio email transazionali ad alta affidabilità
- **QRCode** - Generazione QR codes server-side

### Frontend
- **HTML5/CSS3** - Interfaccia responsive e moderna
- **PayPal SDK** - Integrazione checkout sicura
- **Html5-Qrcode** - Lettore QR code da browser per il check-in

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

# Installa Netlify CLI (opzionale)
npm install netlify-cli -g
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

Esegui lo schema SQL presente in `database/schema.sql` nell'editor SQL di Supabase.

3. **Avvia server locale:**

```bash
# Se hai Netlify CLI
netlify dev

# Oppure
npm start
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
│       │   ├── constants.js          # Costanti globali (es. etichette biglietti)
│       │   ├── emailTemplate.js      # Generatore HTML email
│       │   └── supabase.js           # Client Supabase condiviso
│       ├── config.js                 # Configurazione pubblica (PayPal Client ID, Labels)
│       ├── create-order.js           # Creazione ordine PayPal
│       ├── capture-order.js          # Cattura pagamento + email + QR
│       ├── checkin.js                # Validazione QR all'ingresso
│       └── test.js                   # Test connessione
├── registrazione/
│   ├── registrazione.html            # Form registrazione principale
│   ├── registrazione-iframe.html     # Versione per iframe (Wordpress)
│   └── success.html                  # Pagina conferma
├── checkin.html                      # Web App Scanner QR
├── .env                              # Variabili d'ambiente (non committato)
├── netlify.toml                      # Configurazione build e redirect
├── package.json
└── README.md
```

## 🔌 API Endpoints

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/config` | Configurazione pubblica (Client ID, Labels) |
| POST | `/api/create-order` | Inizializza pagamento PayPal |
| POST | `/api/capture-order` | Finalizza ordine, invia email e genera QR |
| POST | `/api/checkin` | Valida ingresso tramite token QR |

## 💰 Prezzi Biglietti & Configurazione

Le etichette dei biglietti sono centralizzate in `netlify/functions/utils/constants.js`.
Il frontend recupera queste etichette dinamicamente via `/api/config`.

| Tipo | Età | Prezzo |
|------|-----|--------|
| Adulto | 18+ | €10.00 |
| Ragazzo | 12-18 | €5.00 |
| Minore | <12 | Gratis |

## 🚀 Deploy su Netlify & Ottimizzazione

### Risparmio Crediti Build
Per evitare di consumare crediti build inutilmente durante lo sviluppo, usa `[skip ci]` nei messaggi di commit per le modifiche che non richiedono un deploy immediato.

```bash
git commit -m "update styles [skip ci]"
```

### Configurazione Deploy
1. Collega il repo GitHub a Netlify.
2. Imposta le **Environment Variables** (SUPABASE_URL, PAYPAL_SECRET, etc.).
3. Il file `netlify.toml` è già configurato per ottimizzare la build (`command = "exit 0"`).

## 📊 Database Schema

La tabella principale è `registrations`. Campi chiave:
- `qr_token`: Identificativo univoco per il QR Code.
- `checked_in`: Booleano, diventa `true` all'ingresso.
- `email_inviata`: Flag di conferma invio biglietti.

## 🔒 Sicurezza

- ✅ Secrets gestiti lato server (Netlify Functions)
- ✅ Row Level Security (RLS) su Supabase
- ✅ Validazione QR Code server-side

## 📝 License

MIT

## 👤 Author

Gabriele Stefano
- GitHub: [@gabrielestefano1983](https://github.com/gabrielestefano1983)