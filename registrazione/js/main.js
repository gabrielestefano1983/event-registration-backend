import { state } from './modules/state.js';
import { API } from './modules/api.js';
import { Validation } from './modules/validation.js';
import { UI } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get Event ID
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event');

    if (!eventId) {
        UI.showFatalError('Parametro Mancante', 'L\'URL deve includere il parametro ?event=ID');
        return;
    }

    state.setEventId(eventId);

    try {
        // 2. Load Config & Scripts
        const config = await API.fetchConfig(eventId);
        state.setEventConfig(config);

        // Update UI Header
        UI.renderEventHeader(config);
        UI.updateLeaderLabel(
            state.getLabels()['adulto'],
            state.getPrices()['adulto'].toFixed(2)
        );

        // Load PayPal
        await API.loadPayPalScript(config.paypalClientId, config.currency);

        // 3. Init App
        initEventHandlers();

        // Subscribe UI to State changes
        state.subscribe((s) => {
            UI.renderParticipants(s.extraParticipants, s.getLabels(), s.getPrices());
            UI.updateTotal(s.getTotal());
            bindDynamicHandlers(); // Re-bind listeners for new elements
        });

        // First Render
        UI.renderParticipants(state.extraParticipants, state.getLabels(), state.getPrices());
        UI.updateTotal(state.getTotal());

        renderPayPalButton();

        // 4. Reveal UI
        UI.hideLoader();

    } catch (err) {
        console.error(err);
        UI.showFatalError('Errore', err.message || 'Errore imprevisto.');
    }
});

function initEventHandlers() {
    // Leader Inputs
    ['nome', 'email', 'telefono', 'note'].forEach(field => {
        document.getElementById(`leader-${field}`).addEventListener('input', (e) => {
            state.updateLeader(field, e.target.value);
        });
    });

    // Email Validation Visuals
    document.getElementById('leader-email').addEventListener('blur', (e) => {
        const valid = Validation.isValidEmail(e.target.value);
        if (e.target.value && !valid) UI.toggleEmailError(true);
        else UI.toggleEmailError(false);
    });

    // Add Participant Btn
    document.getElementById('add-btn').addEventListener('click', () => {
        const val = Validation.validateLeader(state.leaderData);
        if (!val.valid) {
            UI.showGlobalError(val.error);
            if (val.field) document.getElementById(val.field).focus();
            return;
        }
        state.addParticipant();
    });
}

function bindDynamicHandlers() {
    // Remove Buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(e.target.dataset.idx);
            state.removeParticipant(idx);
        };
    });

    // Participant Inputs
    document.querySelectorAll('.ex-nome').forEach(inp => {
        inp.oninput = (e) => state.updateParticipant(e.target.dataset.idx, 'nome', e.target.value);
    });
    document.querySelectorAll('.ex-tipo').forEach(sel => {
        sel.onchange = (e) => state.updateParticipant(e.target.dataset.idx, 'tipo', e.target.value);
    });
    document.querySelectorAll('.ex-note').forEach(txt => {
        txt.oninput = (e) => state.updateParticipant(e.target.dataset.idx, 'note', e.target.value);
    });
}

function renderPayPalButton() {
    paypal.Buttons({
        fundingSource: paypal.FUNDING.PAYPAL,
        onClick: (data, actions) => {
            const val = Validation.validateAll(state.leaderData, state.extraParticipants);
            if (!val.valid) {
                UI.showGlobalError(val.error);
                return actions.reject();
            }
            return actions.resolve();
        },
        createOrder: async (data, actions) => {
            try {
                return await API.createOrder(state.eventId, state.getFullData());
            } catch (err) {
                console.error(err);
                UI.showGlobalError('Errore creazione ordine');
            }
        },
        onApprove: async (data) => {
            try {
                await API.captureOrder(data.orderID, state.eventId, state.getFullData());
                window.location.href = `/registrazione/success.html?email=${encodeURIComponent(state.leaderData.email)}&event=${state.eventId}`;
            } catch (err) {
                console.error(err);
                UI.showGlobalError('Errore conferma pagamento');
            }
        }
    }).render('#paypal-button-container');
}
