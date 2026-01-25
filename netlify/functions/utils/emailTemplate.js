/**
 * Genera il template HTML per i biglietti
 * @param {string} nomeMaster - Nome del capogruppo
 * @param {Array} tickets - Array di oggetti { nome, tipo, qrUrl }
 * @returns {string} HTML completo
 */
const TIPO_LABELS = {
    'adulto': 'Maggiore 18 anni',
    'ragazzo': 'Tra 12 e 18 anni',
    'minore': 'Minore 12 anni'
};

const getTicketsEmailHtml = (nomeMaster, tickets) => {
    const ticketsHtml = tickets.map(t => `
        <div class="ticket-card" style="border: 2px dashed #cbd5e0; border-radius: 12px; padding: 20px; margin-bottom: 30px; background: #fff;">
            <div class="ticket-info">
                <span class="label" style="font-size: 12px; color: #718096; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; display: block;">Partecipante</span>
                <span class="value" style="font-size: 18px; font-weight: bold; color: #2d3748; margin-bottom: 15px; display: block;">${t.nome}</span>
                
                <span class="label" style="font-size: 12px; color: #718096; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; display: block;">Tipologia Biglietto</span>
                <span class="value" style="font-size: 16px; color: #4a5568; text-transform: capitalize; margin-bottom: 0;">${TIPO_LABELS[t.tipo] || t.tipo}</span>
                
                ${t.note ? `
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #e2e8f0;">
                    <span class="label" style="font-size: 12px; color: #d63384; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; display: block;">Note</span>
                    <span class="value" style="font-size: 14px; color: #2d3748;">${t.note}</span>
                </div>` : ''}

                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #e2e8f0;">
                     <span class="label" style="font-size: 12px; color: #718096; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; display: block;">Prezzo</span>
                     <span class="value" style="font-size: 16px; color: #2d3748; font-weight: bold;">€${t.importo.toFixed(2)}</span>
                </div>
            </div>

            <div class="qr-container" style="text-align: center; margin-top: 20px;">
                <img src="${t.qrUrl}" width="200" height="200" alt="QR Code per ${t.nome}" style="display: inline-block;" />
            </div>
        </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: #2c5282; color: #ffffff; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .content { padding: 30px; }
            .intro { text-align: center; margin-bottom: 30px; }
            .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>I tuoi Biglietti</h1>
                <p style="margin: 5px 0 0; opacity: 0.9;">Evento: Ricerca & Sogni - Il futuro inizia ora</p>
            </div>
            <div class="content">
                <div class="intro">
                    <p style="font-size: 16px;">Ciao <strong>${nomeMaster}</strong>,</p>
                    <p>Ecco i biglietti per te e il tuo gruppo. Mostra i QR Code all'ingresso.</p>
                </div>
                
                ${ticketsHtml}
                
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} <a href="https://www.loredoperlavita.it">www.loredoperlavita.it</a>. Tutti i diritti riservati.</p>
            </div>
        </div>
    </body>
    </html>`;
};

module.exports = { getTicketsEmailHtml };
