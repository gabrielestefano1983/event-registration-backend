const { supabase } = require('./utils/supabase');
const { Resend } = require('resend');
const QRCode = require('qrcode');

const resend = new Resend(process.env.RESEND_API_KEY);
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

exports.handler = async (event) => {
    try {
        console.log('--- START CAPTURE ORDER ---');
        const body = JSON.parse(event.body);
        const { orderID, participants } = body;

        console.log('Order ID:', orderID);
        console.log('Participants:', participants.length);

        if (!orderID || !participants) {
            throw new Error('Missing orderID or participants');
        }

        const masterEmail = participants[0].email;
        const masterTelefono = participants[0].telefono || null;

        // 1. Otteniamo token PayPal
        console.log('1. Getting PayPal Token...');
        const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
        const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
            method: 'POST', body: 'grant_type=client_credentials', headers: { Authorization: `Basic ${auth}` }
        });

        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            throw new Error(`PayPal Token Error: ${err}`);
        }

        const { access_token } = await tokenRes.json();
        console.log('PayPal Token obtained.');

        // 2. Confermiamo il pagamento
        console.log('2. Capturing Payment...');
        const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST', headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' }
        });

        const captureData = await captureRes.json();
        console.log('Capture Status:', captureData.status);

        if (captureData.status === 'COMPLETED' || captureData.status === 'APPROVED') {
            // 3. Ciclo sui partecipanti per DB e Email
            console.log('3. Processing Participants...');
            const listino = { adulto: 10.00, ragazzo: 5.00, minore: 0.00 };
            const numeroGruppo = Date.now();

            const results = [];

            for (const p of participants) {
                console.log(`Processing ${p.nome}...`);
                const qrToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
                const qrDataUrl = await QRCode.toDataURL(qrToken);
                const importo = listino[p.tipo] || 0.00;

                // Salvataggio Supabase
                console.log('Saving to DB...');
                const dbRes = await supabase.from('registrations').insert([{
                    nome: p.nome,
                    email: p.email || masterEmail,
                    telefono: p.telefono || masterTelefono,
                    tipo_partecipante: p.tipo,
                    importo_pagato: importo,
                    pagato: true,
                    paypal_order_id: orderID,
                    numero_ordine_gruppo: numeroGruppo,
                    qr_token: qrToken,
                    note: p.note || null,
                    email_inviata: false
                }]);

                if (dbRes.error) {
                    console.error('Supabase Error:', dbRes.error);
                    // Non blocchiamo tutto, continuiamo con email se possibile
                    results.push({ name: p.nome, status: 'db_error', error: dbRes.error });
                } else {
                    console.log('DB Saved.');
                }

                // Invio Email singola
                console.log('Sending Email...');
                try {
                    const emailRes = await resend.emails.send({
                        from: 'Loredoperlavita <info@loredoperlavita.it>', // Dominio verificato
                        to: masterEmail,
                        subject: `Biglietto di ingresso per ${p.nome}`,
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
                                    <p style="margin: 5px 0 0; opacity: 0.9;">Loredoperlavita Eventi</p>
                                </div>
                                <div class="content">
                                    <p style="font-size: 16px;">Ciao <strong>${p.nome}</strong>, ecco il tuo biglietto!</p>
                                    
                                    <div class="ticket-info">
                                        <span class="label">Partecipante</span>
                                        <span class="value">${p.nome}</span>
                                        
                                        <span class="label">Tipologia Biglietto</span>
                                        <span class="value" style="text-transform: capitalize; margin-bottom: 0;">${p.tipo}</span>
                                    </div>

                                    <div class="qr-container">
                                        <img src="${qrDataUrl}" width="200" height="200" alt="QR Code Biglietto" style="display: block;" />
                                    </div>
                                    
                                    <p style="color: #666; font-size: 14px;">Mostra questo QR Code all'ingresso direttamente dal tuo smartphone.</p>
                                </div>
                                <div class="footer">
                                    <p>&copy; ${new Date().getFullYear()} Loredoperlavita. Tutti i diritti riservati.</p>
                                </div>
                            </div>
                        </body>
                        </html>`
                    });

                    if (emailRes.error) {
                        console.error('Resend API Error:', emailRes.error);
                        results.push({ name: p.nome, status: 'email_error', error: emailRes.error });
                    } else {
                        console.log('Email Sent.');
                        // Aggiorna flag email_inviata
                        await supabase.from('registrations')
                            .update({ email_inviata: true })
                            .eq('qr_token', qrToken);
                        results.push({ name: p.nome, status: 'ok' });
                    }

                } catch (emailError) {
                    console.error('Email Exception:', emailError);
                    results.push({ name: p.nome, status: 'email_exception', error: emailError.message });
                }
            }
            console.log('--- END CAPTURE ORDER ---');
            return {
                statusCode: 200,
                body: JSON.stringify({ status: "ok", results, message: "Order processed" })
            };
        } else {
            console.error('Payment not completed:', captureData);
            return { statusCode: 400, body: JSON.stringify({ error: "Payment not completed", details: captureData }) };
        }
    } catch (e) {
        console.error('FATAL ERROR:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.message, stack: e.stack })
        };
    }
};
