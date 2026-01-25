const { Resend } = require('resend');
const { getTicketEmailHtml } = require('./utils/emailTemplate');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
    // Solo GET per test rapido da browser

    // Log chiave API (parziale) per debug
    const apiKey = process.env.RESEND_API_KEY || 'MISSING';
    console.log('Testing Resend with Key:', apiKey.substring(0, 5) + '...');

    try {
        const dummyQrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TEST-TICKET-12345";
        const emailHtml = getTicketEmailHtml('Stefano Gabriele', 'Adulto (Test)', dummyQrUrl);

        const data = await resend.emails.send({
            from: 'Loredoperlavita <info@loredoperlavita.it>',
            to: ['gabriele.stefano@email.it'], // Tua email fissa per test
            subject: 'Test Design Biglietto',
            html: emailHtml
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
