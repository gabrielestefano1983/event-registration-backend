-- ================================================
-- MIGRATION 004: Update Email Template with Event DateTime
-- Created: 2026-02-01
-- Description: Add DATA_ORA_EVENTO placeholder to default email template
-- ================================================

-- ================================================
-- UPDATE EMAIL TEMPLATE FOR EVENTO DEFAULT
-- ================================================

UPDATE public.eventi
SET email_body_template = '
<html>
<head>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
        }
        .header { 
            background: #3182ce; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2rem;
        }
        .event-date { 
            margin: 10px 0 0 0; 
            font-size: 1.1rem;
            background: rgba(255, 255, 255, 0.2);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
        }
        .content { 
            padding: 30px 20px; 
            max-width: 600px;
            margin: 0 auto;
        }
        .content p {
            margin: 15px 0;
        }
        .footer { 
            background: #f7fafc; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
            color: #718096; 
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{NOME_EVENTO}}</h1>
        <p class="event-date">📅 {{DATA_ORA_EVENTO}}</p>
        <p class="event-location">📍 {{INDIRIZZO_EVENTO}}</p>
    </div>
    <div class="content">
        <p>Ciao <strong>{{NOME_PARTECIPANTE}}</strong>,</p>
        <p>Grazie per la tua registrazione! Ecco i tuoi <strong>{{NUM_BIGLIETTI}} biglietti</strong>:</p>
        {{TICKETS_HTML}}
        <p style="margin-top: 30px;">
            <strong>📱 All''ingresso dell''evento:</strong><br>
            Conserva questa email e mostra il QR code di ogni partecipante.
        </p>
    </div>
    <div class="footer">
        <p><strong>{{NOME_EVENTO}}</strong></p>
        <p>Per informazioni: {{EMAIL_MITTENTE}}</p>
    </div>
</body>
</html>
'
WHERE id = 1;

-- ================================================
-- NOTES
-- ================================================

-- Questo template include:
-- - {{NOME_EVENTO}} - Nome evento
-- - {{DATA_ORA_EVENTO}} - Data e ora formattata (es: "15/06/2026 alle 19:00")
-- - {{INDIRIZZO_EVENTO}} - Indirizzo/luogo dell'evento
-- - {{NOME_PARTECIPANTE}} - Nome del primo partecipante
-- - {{NUM_BIGLIETTI}} - Numero totale biglietti
-- - {{TICKETS_HTML}} - HTML completo dei biglietti con QR code
-- - {{EMAIL_MITTENTE}} - Email di contatto

-- ================================================
-- END MIGRATION 004
-- ================================================
