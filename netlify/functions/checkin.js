const { supabase } = require('./utils/supabase');
const { TIPO_LABELS } = require('./utils/constants');

exports.handler = async (event) => {
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
