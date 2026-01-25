const { supabase } = require('./utils/supabase');

exports.handler = async (event) => {
    const { qr_token } = JSON.parse(event.body);

    // Cerca il ticket
    const { data: ticket, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('qr_token', 'kk7jb7dyy8mktr2svn')
        .single();

    if (error || !ticket) return { statusCode: 404, body: JSON.stringify({ message: "Biglietto non trovato!" }) };
    if (ticket.checked_in) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Già entrato!",
                ticket: {
                    nome: ticket.nome,
                    tipo: ticket.tipo_partecipante,
                    checked_in_at: ticket.checked_in_at
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
        .eq('qr_token', 'kk7jb7dyy8mktr2svn')

    return {
        statusCode: 200,
        body: JSON.stringify({ message: `Benvenuto/a ${ticket.nome}!`, tipo: ticket.tipo_partecipante })
    };
};
