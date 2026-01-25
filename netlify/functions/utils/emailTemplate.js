/**
 * Genera il template HTML per il biglietto
 * @param {string} nomeNome - Nome del partecipante
 * @param {string} tipoBiglietto - Tipo di biglietto (adulto/ragazzo/minore/test)
 * @param {string} qrUrl - URL dell'immagine QR Code
 * @returns {string} HTML completo
 */
const getTicketEmailHtml = (nome, tipoBiglietto, qrUrl) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: #2c5282; color: #ffffff; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .content { padding: 30px; text-align: center; }
            .ticket-info { background: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left; }
            .label { font-size: 12px; color: #718096; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; display: block; }
            .value { font-size: 18px; font-weight: bold; color: #2d3748; margin-bottom: 15px; display: block; }
            .qr-container { margin: 30px 0; padding: 20px; border: 2px dashed #cbd5e0; border-radius: 12px; display: inline-block; }
            .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Il tuo Biglietto</h1>
                <p style="margin: 5px 0 0; opacity: 0.9;">Evento: Presentazione della LorEdo per la Vita</p>
            </div>
            <div class="content">
                <p style="font-size: 16px;">Ciao <strong>${nome}</strong>, ecco il tuo biglietto!</p>
                
                <div class="ticket-info">
                    <span class="label">Partecipante</span>
                    <span class="value">${nome}</span>
                    
                    <span class="label">Tipologia Biglietto</span>
                    <span class="value" style="text-transform: capitalize; margin-bottom: 0;">${tipoBiglietto}</span>
                </div>

                <div class="qr-container">
                    <img src="${qrUrl}" width="200" height="200" alt="QR Code Biglietto" style="display: block;" />
                </div>
                
                <p style="color: #666; font-size: 14px;">Mostra questo QR Code all'ingresso direttamente dal tuo smartphone.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Loredoperlavita. Tutti i diritti riservati.</p>
            </div>
        </div>
    </body>
    </html>`;
};

module.exports = { getTicketEmailHtml };
