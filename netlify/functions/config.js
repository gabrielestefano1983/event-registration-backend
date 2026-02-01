const { TIPO_LABELS, LISTINO_PREZZI } = require('./utils/constants');
const { getEventById, isEventValid } = require('./utils/eventHelpers');

exports.handler = async (event) => {
    try {
        // Leggi eventId dalla query string
        const eventId = event.queryStringParameters?.event;

        // Se non c'è eventId, usa configurazione di default (fallback)
        if (!eventId) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paypalClientId: process.env.PAYPAL_CLIENT_ID,
                    currency: 'EUR',
                    tipoLabels: TIPO_LABELS,
                    prezzi: LISTINO_PREZZI,
                    eventId: null,
                    nomeEvento: 'Registrazione'
                })
            };
        }

        // Carica evento dal database
        const { data: evento, error } = await getEventById(eventId);

        if (error || !evento) {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'Evento non trovato',
                    eventId: eventId
                })
            };
        }

        // Valida l'evento (date e stato)
        const validation = isEventValid(evento);
        if (!validation.valid) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'Evento non disponibile',
                    reason: validation.reason,
                    eventId: eventId,
                    nomeEvento: evento.nome
                })
            };
        }

        // Tutto OK - ritorna configurazione evento
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                paypalClientId: process.env.PAYPAL_CLIENT_ID,
                currency: 'EUR',
                tipoLabels: evento.tipo_labels,
                prezzi: evento.listino_prezzi,
                eventId: evento.id,
                nomeEvento: evento.nome,
                descrizione: evento.descrizione,
                dataOraEvento: evento.data_ora_evento
            })
        };

    } catch (err) {
        console.error('Config error:', err);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Errore server',
                message: err.message
            })
        };
    }
};
