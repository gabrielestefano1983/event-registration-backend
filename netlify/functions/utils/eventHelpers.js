const { supabase } = require('./supabase');

/**
 * Carica un evento dal database
 * @param {number|string} eventId - ID dell'evento
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
async function getEventById(eventId) {
    const { data, error } = await supabase
        .from('eventi')
        .select('*')
        .eq('id', eventId)
        .single();

    return { data, error };
}

/**
 * Verifica se un evento è valido (attivo e dentro range di date)
 * @param {object} evento - Oggetto evento dal DB
 * @returns {{valid: boolean, reason?: string}}
 */
function isEventValid(evento) {
    if (!evento) {
        return { valid: false, reason: 'Evento non trovato' };
    }

    if (!evento.attivo) {
        return { valid: false, reason: 'Evento non attivo' };
    }

    const now = new Date();
    const dataInizio = new Date(evento.data_inizio);
    const dataFine = new Date(evento.data_fine);

    if (now < dataInizio) {
        return {
            valid: false,
            reason: `L'evento non è ancora iniziato. Disponibile dal ${dataInizio.toLocaleDateString('it-IT')}`
        };
    }

    if (now > dataFine) {
        return {
            valid: false,
            reason: `L'evento è terminato il ${dataFine.toLocaleDateString('it-IT')}`
        };
    }

    return { valid: true };
}

/**
 * Sostituisce i placeholder nel template email
 * @param {string} template - Template HTML con placeholder {{NOME}}
 * @param {object} variables - Oggetto con chiavi-valori per sostituzione
 * @returns {string} - HTML renderizzato
 */
function renderEmailTemplate(template, variables) {
    let rendered = template;

    // Sostituisci ogni placeholder {{KEY}} con il valore corrispondente
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        const regex = new RegExp(placeholder, 'g');
        rendered = rendered.replace(regex, value || '');
    }

    return rendered;
}

/**
 * Genera l'HTML per la lista biglietti (da inserire nel template)
 * @param {Array} tickets - Array di oggetti ticket
 * @returns {string} - HTML dei biglietti
 */
function generateTicketsHtml(tickets) {
    return tickets.map(ticket => `
        <div style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 15px 0; background: #f7fafc;">
            <h3 style="margin: 0 0 10px 0; color: #2d3748;">${ticket.nome}</h3>
            <p style="margin: 5px 0; color: #4a5568;">
                <strong>Tipo:</strong> ${ticket.tipo_label || ticket.tipo}
            </p>
            ${ticket.note ? `<p style="margin: 5px 0; color: #718096;"><strong>Note:</strong> ${ticket.note}</p>` : ''}
            ${ticket.importo > 0 ? `<p style="margin: 5px 0; color: #2d3748;"><strong>Importo:</strong> €${ticket.importo.toFixed(2)}</p>` : ''}
            <div style="text-align: center; margin-top: 15px;">
                <img src="${ticket.qrUrl}" alt="QR Code ${ticket.nome}" style="max-width: 200px; height: auto;" />
            </div>
        </div>
    `).join('');
}

module.exports = {
    getEventById,
    isEventValid,
    renderEmailTemplate,
    generateTicketsHtml
};
