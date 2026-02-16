export const Validation = {
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase().trim());
    },

    validateLeader(leaderData) {
        if (!leaderData.nome || !leaderData.nome.trim()) {
            return { valid: false, error: "Per favore, inserisci il Nome e Cognome del Capogruppo.", field: 'leader-nome' };
        }
        if (!leaderData.email || !this.isValidEmail(leaderData.email)) {
            return { valid: false, error: "Per favore, inserisci una Email valida per il Capogruppo.", field: 'leader-email' };
        }
        if (!leaderData.telefono || !leaderData.telefono.trim()) {
            return { valid: false, error: "Per favore, inserisci il Numero di telefono del Capogruppo.", field: 'leader-telefono' };
        }
        return { valid: true };
    },

    validateAll(leaderData, participants) {
        const leaderVal = this.validateLeader(leaderData);
        if (!leaderVal.valid) return leaderVal;

        for (let i = 0; i < participants.length; i++) {
            if (!participants[i].nome || !participants[i].nome.trim()) {
                return { valid: false, error: "Inserisci il nome di tutti i partecipanti extra." };
            }
        }

        return { valid: true };
    }
};
