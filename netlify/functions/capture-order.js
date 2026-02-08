const { supabase } = require('./utils/supabase');
const { Resend } = require('resend');
const QRCode = require('qrcode');
const { getEventById, isEventValid, renderEmailTemplate, generateTicketsHtml } = require('./utils/eventHelpers');

const resend = new Resend(process.env.RESEND_API_KEY);
const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

exports.handler = async (event) => {
    try {
        console.log('--- START CAPTURE ORDER ---');
        const body = JSON.parse(event.body);
        const { orderID, participants, eventId } = body;

        console.log('Order ID:', orderID);
        console.log('Event ID:', eventId);
        console.log('Participants:', participants.length);

        if (!orderID || !participants || !eventId) {
            throw new Error('Missing orderID, participants, or eventId');
        }

        // VALIDAZIONE DATI (Difesa in profondità)
        const leader = participants[0];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!leader.nome || !leader.nome.trim()) throw new Error('Nome del Capogruppo obbligatorio');
        if (!leader.email || !emailRegex.test(leader.email)) throw new Error('Email del Capogruppo non valida');
        if (!leader.telefono || !leader.telefono.trim()) throw new Error('Telefono del Capogruppo obbligatorio');

        for (let i = 1; i < participants.length; i++) {
            if (!participants[i].nome || !participants[i].nome.trim()) {
                throw new Error(`Nome mancante per il partecipante #${i + 1}`);
            }
        }

        // Carica e valida evento
        const { data: evento, error: eventoError } = await getEventById(eventId);
        if (eventoError || !evento) {
            throw new Error('Evento non trovato');
        }

        const validation = isEventValid(evento);
        if (!validation.valid) {
            throw new Error(`Evento non valido: ${validation.reason}`);
        }

        const listino = evento.listino_prezzi;
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
            // 3. Elaborazione Parallela Partecipanti
            console.log('3. Processing Participants (Parallel)...');
            const numeroGruppo = Date.now();

            // Creiamo un array di PROMESSE (operazioni che partono insieme)
            const tasks = participants.map(async (p) => {
                try {
                    console.log(`Starting process for ${p.nome}...`);
                    const qrToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

                    // A. Generazione QR (CPU bound, ma veloce)
                    const qrBuffer = await QRCode.toBuffer(qrToken);

                    // B. Upload Storage (Network IO)
                    const fileName = `qr-${qrToken}.png`;
                    const { error: uploadError } = await supabase.storage
                        .from('qr-codes')
                        .upload(fileName, qrBuffer, {
                            contentType: 'image/png',
                            upsert: true
                        });

                    let qrDataUrl;
                    if (uploadError) {
                        console.error(`[${p.nome}] Upload Error:`, uploadError);
                        qrDataUrl = await QRCode.toDataURL(qrToken); // Fallback
                    } else {
                        const { data: publicUrlData } = supabase.storage
                            .from('qr-codes')
                            .getPublicUrl(fileName);
                        qrDataUrl = publicUrlData.publicUrl;
                    }

                    // C. Salvataggio DB (Network IO)
                    const importo = listino[p.tipo] || 0.00;

                    const { error: dbError } = await supabase.from('registrations').insert([{
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
                        email_inviata: false,
                        evento_id: eventId,
                        gratuito: false  // Sempre false per registrazioni PayPal
                    }]);

                    if (dbError) {
                        console.error(`[${p.nome}] DB Error:`, dbError);
                        return { status: 'error', error: dbError, name: p.nome };
                    }

                    // Aggiungi tipo_label per email
                    const tipoLabel = evento.tipo_labels[p.tipo] || p.tipo;

                    return {
                        status: 'ok',
                        ticket: {
                            nome: p.nome,
                            tipo: p.tipo,
                            tipo_label: tipoLabel,
                            qrUrl: qrDataUrl,
                            qrToken: qrToken,
                            note: p.note,
                            importo: importo,
                            gratuito: false  // Sempre false per PayPal
                        }
                    };

                } catch (err) {
                    console.error(`[${p.nome}] Exception:`, err);
                    return { status: 'error', error: err.message, name: p.nome };
                }
            });

            // Attendiamo che TUTTI finiscano
            const resultsRaw = await Promise.all(tasks);

            // Filtriamo i risultati
            const results = resultsRaw.map(r => ({ name: r.name, status: r.status, error: r.error }));
            const tickets = resultsRaw.filter(r => r.status === 'ok').map(r => r.ticket);

            // Send Single Email with Custom Template
            if (tickets.length > 0) {
                console.log(`Sending single email with ${tickets.length} tickets to ${masterEmail}...`);
                try {
                    // Genera HTML dei biglietti
                    const ticketsHtml = generateTicketsHtml(tickets);

                    // Formatta data e ora evento per email
                    let dataOraFormatted = '';
                    if (evento.data_ora_evento) {
                        const dataEvento = new Date(evento.data_ora_evento);
                        const dataStr = dataEvento.toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            timeZone: 'Europe/Rome'
                        });
                        const oraStr = dataEvento.toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Europe/Rome'
                        });
                        dataOraFormatted = `${dataStr} alle ${oraStr}`;
                    }

                    // Renderizza template custom dall'evento
                    const emailHtml = renderEmailTemplate(evento.email_body_template, {
                        NOME_EVENTO: evento.nome,
                        NOME_PARTECIPANTE: participants[0].nome,
                        TICKETS_HTML: ticketsHtml,
                        EMAIL_MITTENTE: evento.email_mittente,
                        NUM_BIGLIETTI: tickets.length,
                        DATA_ORA_EVENTO: dataOraFormatted,
                        INDIRIZZO_EVENTO: evento.indirizzo || ''
                    });

                    const emailRes = await resend.emails.send({
                        from: `${evento.email_mittente_nome} <${evento.email_mittente}>`,
                        to: masterEmail,
                        subject: evento.email_oggetto.replace('{{NUM_BIGLIETTI}}', tickets.length),
                        html: emailHtml
                    });

                    if (emailRes.error) {
                        console.error('Resend API Error:', emailRes.error);
                    } else {
                        console.log('Email Sent.');
                        // Update email_inviata for all tickets
                        const tokens = tickets.map(t => t.qrToken);
                        console.log('Updating email_inviata for tokens:', tokens);

                        const { error: updateError } = await supabase.from('registrations')
                            .update({ email_inviata: true })
                            .in('qr_token', tokens);

                        if (updateError) {
                            console.error('Error updating email_inviata:', updateError);
                        } else {
                            console.log('Database updated: email_inviata = true');
                        }
                    }
                } catch (emailError) {
                    console.error('Email Exception:', emailError);
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
