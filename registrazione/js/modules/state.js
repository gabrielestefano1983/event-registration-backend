import { CONFIG } from './config.js';

class StateManager {
    constructor() {
        this.leaderData = {
            nome: '',
            email: '',
            telefono: '',
            note: '',
            tipo: 'adulto'
        };
        this.extraParticipants = [];
        this.eventId = null;
        this.evtConfig = null;
        this.listeners = [];
    }

    setEventId(id) {
        this.eventId = id;
    }

    setEventConfig(config) {
        this.evtConfig = config;
        this.notify();
    }

    updateLeader(field, value) {
        this.leaderData[field] = value;
        // Leader changes generally don't require full UI re-renders, 
        // but price might change if leader type changes (currently fixed to adult)
        // this.notify(); 
    }

    addParticipant() {
        this.extraParticipants.push({ nome: '', tipo: 'adulto', note: '' });
        this.notify();
    }

    removeParticipant(index) {
        this.extraParticipants.splice(index, 1);
        this.notify();
    }

    updateParticipant(index, field, value) {
        if (this.extraParticipants[index]) {
            this.extraParticipants[index][field] = value;
            if (field === 'tipo') this.notify(); // Re-calc total
        }
    }

    getPrices() {
        return this.evtConfig?.prezzi || CONFIG.DEFAULTS.PRICES;
    }

    getLabels() {
        return this.evtConfig?.tipoLabels || CONFIG.DEFAULTS.LABELS;
    }

    getTotal() {
        const prices = this.getPrices();
        let total = prices.adulto; // Leader is always adult
        this.extraParticipants.forEach(p => {
            total += prices[p.tipo] || 0;
        });
        return total.toFixed(2);
    }

    getFullData() {
        return [this.leaderData, ...this.extraParticipants];
    }

    // Observer Pattern
    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this));
    }
}

export const state = new StateManager();
