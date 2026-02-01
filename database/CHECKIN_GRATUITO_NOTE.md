# 📝 Note su checkin.html e Ticket Gratuiti

## ✅ Situazione Attuale

Il file `checkin.html` **NON visualizza** il campo prezzo/importo.

Mostra solo:
- Nome partecipante
- Tipo (con label)
- Note (se presenti)
- Stato check-in

**Quindi non serve modificare nulla** per i ticket gratuiti! ✅

---

## 💡 Se in Futuro Vuoi Mostrare il Prezzo

### Backend: checkin.js

Aggiungere il campo `importo_pagato` e `gratuito` alla risposta:

```javascript
const { data, error } = await supabase
    .from('registrations')
    .select('nome, tipo_partecipante, checked_in, checked_in_at, note, importo_pagato, gratuito')
    .eq('qr_token', qr_token)
    .single();

return {
    statusCode: 200,
    body: JSON.stringify({
        message: `Benvenuto/a ${data.nome}!`,
        tipo: tipoLabel,
        note: data.note,
        importo: data.importo_pagato,
        gratuito: data.gratuito
    })
};
```

### Frontend: checkin.html

Modificare la funzione `showResult()` per mostrare il prezzo:

```javascript
// Dopo il tipo, aggiungi:
if (data.gratuito) {
    html += `<div class="sub-detail" style="color: #48bb78; font-weight: bold; margin-top: 10px;">
        🎟️ TICKET GRATUITO
    </div>`;
} else if (data.importo > 0) {
    html += `<div class="sub-detail" style="margin-top: 10px;">
        💰 Importo: €${data.importo.toFixed(2)}
    </div>`;
}
```

### Risultato UI

**Ticket Normale:**
```
✅ VALIDO
Mario Rossi
MAGGIORE DI 18 ANNI
💰 Importo: €15.00
```

**Ticket Gratuito:**
```
✅ VALIDO
Luigi Bianchi
MAGGIORE DI 18 ANNI
🎟️ TICKET GRATUITO
```

---

## 📊 Search Results

Anche nella ricerca manuale (`doSearch()`), se vuoi mostrare il prezzo:

```javascript
// In data.forEach(t => { ... })
let priceHtml = '';
if (t.gratuito) {
    priceHtml = '<span style="color: #48bb78; font-weight: bold;">🎟️ GRATUITO</span>';
} else {
    priceHtml = `<span>€${t.importo_pagato.toFixed(2)}</span>`;
}

item.innerHTML = `
    <div style="font-weight:bold; font-size:1.1rem;">${t.nome}</div>
    <div style="font-size:0.9rem; color:#555;">${t.email}</div>
    <div style="display:flex; justify-content:space-between; margin-top:5px; font-size:0.8rem; font-weight:700;">
        <span>${t.tipo_label}</span>
        <span>${priceHtml}</span>
        <span style="color:${t.checked_in ? '#d63384' : '#28a745'}">${statusLabel}</span>
    </div>
`;
```

---

## ✅ Conclusione

**Per ora non serve fare nulla** - il sistema checkin è già OK per ticket gratuiti.

Usa questa nota solo se decidi di aggiungere la visualizzazione del prezzo in futuro.

---

**Creato**: 2026-02-01  
**File**: `checkin.html`
