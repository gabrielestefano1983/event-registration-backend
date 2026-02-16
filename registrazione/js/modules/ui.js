export const UI = {
    elements: {
        loader: document.getElementById('loading-modal'),
        mainRoot: document.getElementById('event-reg-root'),
        title: document.querySelector('h2'),
        headerDescPanel: document.querySelector('.header-section p'),
        extrasList: document.getElementById('extras-list'),
        totalDisplay: document.getElementById('total-display'),
        leaderTicketLabel: document.getElementById('leader-ticket-label'),
        globalError: null
    },

    showLoader() {
        this.elements.loader.style.display = 'flex';
    },

    hideLoader() {
        this.elements.loader.style.display = 'none';
        this.elements.mainRoot.style.display = 'block';
    },

    renderEventHeader(config) {
        if (!config.nomeEvento || config.nomeEvento === 'Registrazione') return;

        this.elements.title.innerText = config.nomeEvento;
        if (config.descrizione) {
            this.elements.headerDescPanel.innerText = config.descrizione;
        }

        const insertAfter = (newNode, referenceNode) => {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        };
        let lastElem = this.elements.headerDescPanel || this.elements.title;

        if (config.dataOraEvento) {
            const d = new Date(config.dataOraEvento);
            const dateStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

            const p = document.createElement('p');
            p.className = 'event-date';
            p.innerHTML = `📅 ${dateStr} alle ${timeStr}`;
            insertAfter(p, lastElem);
            lastElem = p;
        }

        if (config.indirizzo) {
            const p = document.createElement('p');
            p.className = 'event-location';
            p.innerHTML = `📍 ${config.indirizzo}`;
            insertAfter(p, lastElem);
        }
    },

    updateLeaderLabel(label, price) {
        if (this.elements.leaderTicketLabel) {
            this.elements.leaderTicketLabel.innerText = `Biglietto: ${label} (€${price})`;
        }
    },

    updateTotal(amount) {
        if (this.elements.totalDisplay) {
            this.elements.totalDisplay.innerText = `${amount}€`;
        }
    },

    renderParticipants(participants, labels, prices) {
        this.elements.extrasList.innerHTML = '';
        participants.forEach((p, i) => {
            const div = document.createElement('div');
            div.className = 'participant-card';

            const options = Object.keys(prices).map(k => {
                const label = labels[k] || k;
                const priceVal = prices[k];
                const priceTxt = priceVal === 0 ? 'Gratis' : `€${priceVal.toFixed(2)}`;
                return `<option value="${k}" ${p.tipo === k ? 'selected' : ''}>${label} (${priceTxt})</option>`;
            }).join('');

            div.innerHTML = `
                <div class="participant-header">
                    <span class="participant-label">👤 Partecipante #${i + 2}</span>
                    <button type="button" class="remove-btn" data-idx="${i}">Rimuovi ✕</button>
                </div>
                <div class="input-grid">
                    <input type="text" placeholder="Nome e Cognome" class="ex-nome" data-idx="${i}" value="${p.nome}">
                    <select class="ex-tipo" data-idx="${i}">${options}</select>
                    <textarea placeholder="Note" class="ex-note" data-idx="${i}">${p.note || ''}</textarea>
                </div>
            `;
            this.elements.extrasList.appendChild(div);
        });
    },

    toggleEmailError(show) {
        const el = document.getElementById('email-error');
        const input = document.getElementById('leader-email');
        if (show) {
            el.style.display = 'block';
            input.style.borderColor = '#e53e3e';
            input.style.borderWidth = '2px';
        } else {
            el.style.display = 'none';
            input.style.borderColor = '#cbd5e0';
            input.style.borderWidth = '1px';
        }
    },

    showGlobalError(msg) {
        let errDiv = document.getElementById('global-error-msg');
        if (!errDiv) {
            errDiv = document.createElement('div');
            errDiv.id = 'global-error-msg';
            errDiv.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:none; justify-content:center; align-items:center;";
            errDiv.innerHTML = `
                <div class="error-modal-content">
                    <div class="error-modal-icon">⚠️</div>
                    <p id="global-error-text" class="error-modal-text"></p>
                    <button class="error-modal-btn">OK, ho capito</button>
                </div>`;
            document.body.appendChild(errDiv);
            errDiv.querySelector('button').onclick = () => errDiv.style.display = 'none';
            errDiv.onclick = (e) => { if (e.target === errDiv) errDiv.style.display = 'none'; };
        }
        document.getElementById('global-error-text').innerText = msg;
        errDiv.style.display = 'flex';
    },

    showFatalError(title, msg) {
        this.elements.loader.style.display = 'none';
        document.body.innerHTML = `
            <div class="missing-params">
                <h1>⚠️ ${title}</h1>
                <p>${msg}</p>
            </div>`;
    }
};
