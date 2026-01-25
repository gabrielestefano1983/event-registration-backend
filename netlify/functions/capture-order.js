const { supabase } = require('./utils/supabase');
const { Resend } = require('resend');
const QRCode = require('qrcode');

const resend = new Resend(process.env.RESEND_API_KEY);
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

exports.handler = async (event) => {
    const { orderID, participants } = JSON.parse(event.body);
    const masterEmail = participants[0].email;
    const masterTelefono = participants[0].telefono || null;

    // 1. Otteniamo token PayPal
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
    const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST', body: 'grant_type=client_credentials', headers: { Authorization: `Basic ${auth}` }
    });
    const { access_token } = await tokenRes.json();

    // 2. Confermiamo il pagamento
    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST', headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' }
    });
    const captureData = await captureRes.json();

    if (captureData.status === 'COMPLETED') {
        // 3. Ciclo sui partecipanti per DB e Email
        const listino = { adulto: 10.00, ragazzo: 5.00, minore: 0.00 };
        const numeroGruppo = Date.now(); // Numero progressivo per il gruppo

        for (const p of participants) {
            const qrToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            const qrDataUrl = await QRCode.toDataURL(qrToken);
            const importo = listino[p.tipo] || 0.00;

            // Salvataggio Supabase
            await supabase.from('registrations').insert([{
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

            // Invio Email singola per partecipante
            try {
                await resend.emails.send({
                    from: 'Evento <biglietti@tuodominio.com>',
                    to: masterEmail,
                    subject: `Biglietto di ingresso per ${p.nome}`,
                    html: `<div style="text-align:center; font-family:sans-serif;">
                <h1>Biglietto per ${p.nome}</h1>
                <p>Tipo: ${p.tipo}</p>
                <img src="${qrDataUrl}" width="250" />
                <p>Presenta questo codice all'ingresso.</p>
               </div>`
                });

                // Aggiorna flag email_inviata
                await supabase.from('registrations')
                    .update({ email_inviata: true })
                    .eq('qr_token', qrToken);

            } catch (emailError) {
                console.error('Errore invio email per', p.nome, ':', emailError);
            }
        }
        return { statusCode: 200, body: JSON.stringify({ status: "ok" }) };
    }
    return { statusCode: 400, body: "Errore pagamento" };
};
