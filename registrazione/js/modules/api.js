import { CONFIG } from './config.js';

export const API = {
    async fetchConfig(eventId) {
        const configUrl = `${CONFIG.API_BASE}/config?event=${eventId}`;
        const res = await fetch(configUrl);
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.reason || errorData.error || 'Evento non disponibile');
        }
        return await res.json();
    },

    loadPayPalScript(clientId, currency) {
        return new Promise((resolve, reject) => {
            if (window.paypal) return resolve();

            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    async createOrder(eventId, participants) {
        const res = await fetch(`${CONFIG.API_BASE}/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, participants })
        });
        const order = await res.json();
        return order.id;
    },

    async captureOrder(orderID, eventId, participants) {
        const res = await fetch(`${CONFIG.API_BASE}/capture-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID, eventId, participants })
        });
        if (!res.ok) throw new Error('Capture failed');
        return await res.json();
    }
};
