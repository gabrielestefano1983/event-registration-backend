# WordPress Integration - Guida

## 🚨 Problema: PayPal Popup si chiude in iframe

**Causa:** I browser bloccano i popup quando il contenuto è caricato in un iframe per motivi di sicurezza.

**Soluz ione implementata:** Pagina di redirect che rileva iframe e invita l'utente ad aprire in nuova finestra.

---

## ✅ Come Integrare in WordPress

### **Soluzione 1: Link Diretto (Consigliata)**

Invece di incorporare con iframe, usa un semplice link:

```html
<a href="https://remarkable-biscochitos-1c0f1e.netlify.app/registrazione/registrazione.html" 
   target="_blank" 
   class="wp-block-button__link">
    Registrati all'Evento
</a>
```

**Vantaggi:**
- ✅ Nessun problema con popup
- ✅ Esperienza utente migliore
- ✅ Form a schermo intero

---

### **Soluzione 2: Iframe con Avviso**

Se preferisci comunque l'iframe, usa la pagina embed:

```html
<iframe 
    src="https://remarkable-biscochitos-1c0f1e.netlify.app/registrazione/registrazione-embed.html"
    width="100%" 
    height="900" 
    frameborder="0"
    scrolling="auto">
</iframe>
```

Questa pagina:
1. Rileva che è in iframe
2. Mostra un avviso
3. Offre pulsante per aprire in nuova finestra

---

### **Soluzione 3: Shortcode WordPress (Avanzata)**

Crea uno shortcode nel tema:

```php
// Aggiungi in functions.php
function evento_registrazione_shortcode() {
    return '<div style="text-align:center; padding:40px; background:#f3f4f6; border-radius:12px;">
        <h3>Registrati all\'Evento</h3>
        <p>Compila il modulo e ricevi i biglietti via email</p>
        <a href="https://remarkable-biscochitos-1c0f1e.netlify.app/registrazione/registrazione.html" 
           target="_blank" 
           style="display:inline-block; background:#667eea; color:white; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:600;">
            Vai al Modulo di Registrazione →
        </a>
    </div>';
}
add_shortcode('evento_registrazione', 'evento_registrazione_shortcode');
```

Poi usa in qualsiasi pagina:
```
[evento_registrazione]
```

---

## 🔧 Come Modificare la Pagina WordPress

1. Vai su **loredoperlavita.it/evento-presentazione-associazione/**
2. Modifica la pagina in Gutenberg
3. Se c'è un iframe, **rimuovilo**
4. Aggiungi un **pulsante** con link a:
   ```
   https://remarkable-biscochitos-1c0f1e.netlify.app/registrazione/registrazione.html
   ```
5. Imposta `target="_blank"` per aprire in nuova finestra

---

## 📱 Test

Dopo la modifica, il flusso sarà:
1. User su WordPress clicca "Registrati"
2. Si apre nuova finestra con form
3. Compila e paga con PayPal
4. Riceve email con biglietti
5. Può chiudere la finestra e tornare a WordPress

**Nessun problema con popup!** ✅

---

## 🎨 CSS Personalizzato (Opzionale)

Per rendere il pulsante più accattivante su WordPress:

```css
.evento-registrazione-btn {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 32px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 700;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.evento-registrazione-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    color: white;
}
```
