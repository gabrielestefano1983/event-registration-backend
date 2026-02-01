-- ================================================
-- MIGRATION 006: Finalize Email Template with Location
-- Created: 2026-02-01
-- Description: Updates email template to include INDIRIZZO_EVENTO
--              Ensures template is correct after migration 005
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
        .event-info {
            margin-top: 15px;
            font-size: 1.1rem;
        }
        .event-badge {
            background: rgba(255, 255, 255, 0.2);
            display: inline-block;
            padding: 5px 15px;
            border-radius: 15px;
            margin: 5px;
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
        <div class="event-info">
            <span class="event-badge">📅 {{DATA_ORA_EVENTO}}</span>
            <br>
            <span class="event-badge">📍 {{INDIRIZZO_EVENTO}}</span>
        </div>
    </div>
    <div class="content">
        <p>Ciao <strong>{{NOME_PARTECIPANTE}}</strong>,</p>
        <p>Grazie per la tua registrazione! Ecco i tuoi <strong>biglietti</strong> ({{NUM_BIGLIETTI}} in totale):</p>
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
-- END MIGRATION 006
-- ================================================
