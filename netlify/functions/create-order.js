const { getEventById, isEventValid } = require('./utils/eventHelpers');

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405 };

    try {
        const { eventId, participants } = JSON.parse(event.body);

        // Validazione input base
        if (!eventId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'EventId mancante' })
            };
        }

        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Dati partecipanti mancanti' })
            };
        }

        // Validazione Capogruppo
        const leader = participants[0];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!leader.nome || !leader.nome.trim()) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Nome del Capogruppo obbligatorio' }) };
        }
        if (!leader.email || !emailRegex.test(leader.email)) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Email del Capogruppo non valida' }) };
        }
        if (!leader.telefono || !leader.telefono.trim()) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Telefono del Capogruppo obbligatorio' }) };
        }

        // Validazione Partecipanti Extra
        for (let i = 1; i < participants.length; i++) {
            if (!participants[i].nome || !participants[i].nome.trim()) {
                return { statusCode: 400, body: JSON.stringify({ error: `Nome mancante per il partecipante #${i + 1}` }) };
            }
        }

        // Carica e valida evento
        const { data: evento, error: dbError } = await getEventById(eventId);
        if (dbError || !evento) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Evento non trovato' })
            };
        }

        const validation = isEventValid(evento);
        if (!validation.valid) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Evento non disponibile',
                    reason: validation.reason
                })
            };
        }

        // Usa il listino prezzi dell'evento
        const listino = evento.listino_prezzi;

        // Sicurezza: il capogruppo paga sempre come adulto
        participants[0].tipo = 'adulto';

        // Calcolo del totale reale
        const totalAmount = participants.reduce((sum, p) => sum + (listino[p.tipo] || 0), 0);

        // 1. Otteniamo il token da PayPal
        const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
        const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: { Authorization: `Basic ${auth}` }
        });
        const { access_token } = await tokenRes.json();

        // 2. Creiamo l'ordine
        const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: { currency_code: 'EUR', value: totalAmount.toFixed(2) },
                    description: `${evento.nome} - ${participants.length} partecipanti`
                }]
            })
        });

        const order = await orderRes.json();
        return { statusCode: 200, body: JSON.stringify({ id: order.id }) };

    } catch (err) {
        console.error('Error create-order:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
