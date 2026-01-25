const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // In produzione togli .sandbox

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405 };

    const { participants } = JSON.parse(event.body);
    const listino = { adulto: 10.00, ragazzo: 5.00, minore: 0.00 };

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
                description: `Registrazione per ${participants.length} persone`
            }]
        })
    });

    const order = await orderRes.json();
    return { statusCode: 200, body: JSON.stringify({ id: order.id }) };
};
