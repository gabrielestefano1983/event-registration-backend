const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;

exports.handler = async (event) => {
    // Ritorna la configurazione pubblica client-side
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            paypalClientId: PAYPAL_CLIENT_ID,
            currency: 'EUR'
        })
    };
};
