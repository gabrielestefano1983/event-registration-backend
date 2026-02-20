exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { password } = JSON.parse(event.body);
        const validPassword = process.env.CHECKIN_PAGE_PASSWORD;

        if (!validPassword) {
            // Se non c'è password configurata, permetti l'accesso di default
            return { statusCode: 200, body: JSON.stringify({ valid: true }) };
        }

        if (password === validPassword) {
            return { statusCode: 200, body: JSON.stringify({ valid: true }) };
        } else {
            return { statusCode: 401, body: JSON.stringify({ valid: false, message: "Password errata" }) };
        }
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: "Richiesta non valida" }) };
    }
};
