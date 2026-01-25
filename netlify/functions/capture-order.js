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
                        from: 'Loredoperlavita <info@loredoperlavita.it>', // Dominio verificato (DKIM ok)
                        to: masterEmail,
                        subject: `Biglietto di ingresso per ${p.nome}`,
                        html: `<div style="text-align:center; font-family:sans-serif;">
                            <h1>Biglietto per ${p.nome}</h1>
                            <p>Tipo: ${p.tipo}</p>
                            <img src="${qrDataUrl}" width="250" />
                            <p>Presenta questo codice all'ingresso.</p>
                        </div>`
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
