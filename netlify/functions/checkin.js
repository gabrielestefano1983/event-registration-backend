const { supabase } = require('./utils/supabase');
const { TIPO_LABELS } = require('./utils/constants');

exports.handler = async (event) => {
    // 1. GESTIONE RICERCA (GET)
    if (event.httpMethod === 'GET') {
        const query = event.queryStringParameters.q;
        if (!query || query.length < 3) {
            return { statusCode: 400, body: JSON.stringify({ message: "Inserisci almeno 3 caratteri" }) };
        }

        const { data: tickets, error } = await supabase
            .from('registrations')
            .select('nome, email, tipo_partecipante, qr_token, checked_in, checked_in_at')
            .or(`nome.ilike.%${query}%,email.ilike.%${query}%`)
            .limit(20);

        if (error) {
            return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
        }

        // Formatta i risultati con le etichette corrette
        const results = tickets.map(t => ({
            ...t,
            tipo_label: TIPO_LABELS[t.tipo_partecipante] || t.tipo_partecipante
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(results)
        };
    }

    // 2. GESTIONE CHECK-IN (POST)
    const { qr_token } = JSON.parse(event.body);

    // Cerca il ticket
    const { data: ticket, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('qr_token', qr_token)
        .single();

    if (error || !ticket) return { statusCode: 404, body: JSON.stringify({ message: "Biglietto non trovato!" }) };
    if (ticket.checked_in) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Già entrato!",
                ticket: {
                    nome: ticket.nome,
                    tipo: TIPO_LABELS[ticket.tipo_partecipante] || ticket.tipo_partecipante,
                    checked_in_at: ticket.checked_in_at,
                    note: ticket.note
                }
            })
        };
    }

    // Segna come entrato con timestamp
    await supabase.from('registrations')
        .update({
            checked_in: true,
            checked_in_at: new Date().toISOString()
        })
        .eq('qr_token', qr_token)

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Benvenuto/a ${ticket.nome}!`,
            tipo: TIPO_LABELS[ticket.tipo_partecipante] || ticket.tipo_partecipante,
            note: ticket.note
        })
    };
};
