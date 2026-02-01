const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const { TIPO_LABELS, LISTINO_PREZZI } = require('./utils/constants');

exports.handler = async (event) => {
    // Ritorna la configurazione pubblica client-side
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
            prezzi: LISTINO_PREZZI
        })
    };
};
