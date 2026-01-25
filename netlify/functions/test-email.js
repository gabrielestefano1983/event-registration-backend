const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
    // Solo GET per test rapido da browser

    // Log chiave API (parziale) per debug
    const apiKey = process.env.RESEND_API_KEY || 'MISSING';
    console.log('Testing Resend with Key:', apiKey.substring(0, 5) + '...');

    try {
        const data = await resend.emails.send({
            from: 'Loredoperlavita <info@loredoperlavita.it>',
            to: ['gabriele.stefano@email.it'], // Tua email fissa per test
            subject: 'Test Design Biglietto',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: #2c5282; color: #ffffff; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
                    .content { padding: 30px; text-align: center; }
                    .ticket-info { background: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left; }
                    .label { font-size: 12px; color: #718096; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; display: block; }
                    .value { font-size: 18px; font-weight: bold; color: #2d3748; margin-bottom: 15px; display: block; }
                    .qr-container { margin: 30px 0; padding: 20px; border: 2px dashed #cbd5e0; border-radius: 12px; display: inline-block; }
                    .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Il tuo Biglietto</h1>
                        <p style="margin: 5px 0 0; opacity: 0.9;">Loredoperlavita Eventi - TEST PREVIEW</p>
                    </div>
                    <div class="content">
                        <p style="font-size: 16px;">Ciao <strong>Stefano Gabriele</strong>, ecco una preview del tuo biglietto!</p>
                        
                        <div class="ticket-info">
                            <span class="label">Partecipante</span>
                            <span class="value">Stefano Gabriele</span>
                            
                            <span class="label">Tipologia Biglietto</span>
                            <span class="value" style="text-transform: capitalize; margin-bottom: 0;">Adulto (Test)</span>
                        </div>

                        <div class="qr-container">
                            <!-- QR Code Statico per test -->
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TEST-TICKET-12345" width="200" height="200" alt="QR Code Biglietto" style="display: block;" />
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">Mostra questo QR Code all'ingresso.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Loredoperlavita. Tutti i diritti riservati.</p>
                    </div>
                </div>
            </body>
            </html>`
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
