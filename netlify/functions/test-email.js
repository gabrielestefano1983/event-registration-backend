const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
    // Solo GET per test rapido da browser

    // Log chiave API (parziale) per debug
    const apiKey = process.env.RESEND_API_KEY || 'MISSING';
    console.log('Testing Resend with Key:', apiKey.substring(0, 5) + '...');

    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // Dominio di test che funziona SUBITO
            to: ['gabriele.stefano@email.it'], // Tua email (unica consentita in test)
            subject: 'Test invio email Evento',
            html: '<strong>Funziona!</strong> <p>Se leggi questo, la configurazione Resend è corretta.</p>'
        });

        console.log('Email sent result:', data);

        if (data.error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: data.error })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Email inviata correttamente!", data })
        };
    } catch (error) {
        console.error('Email send failed:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message, stack: error.stack })
        };
    }
};
