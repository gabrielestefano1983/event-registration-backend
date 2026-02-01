# 📧 Email Template - Placeholder Disponibili

Quando crei o modifichi l'email template di un evento, puoi usare questi placeholder:

## 📋 Placeholder Disponibili

### **{{NOME_EVENTO}}**
Nome dell'evento (es: "Concerto Estate 2026")

### **{{NOME_PARTECIPANTE}}**
Nome del primo partecipante nella registrazione

### **{{DATA_ORA_EVENTO}}**
Data e ora dell'evento formattata (es: "15/06/2026 alle 19:00")

### **{{INDIRIZZO_EVENTO}}**
Indirizzo/luogo dell'evento (es: "Via Example 123, Milano")

### **{{TICKETS_HTML}}**
HTML completo con tutti i biglietti (già formattati con QR code)

### **{{EMAIL_MITTENTE}}**
Email mittente configurata per l'evento

### **{{NUM_BIGLIETTI}}**
Numero totale di biglietti in questa email

---

## 📝 Template di Esempio

### Versione Base
```html
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #3182ce; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f7fafc; padding: 15px; text-align: center; font-size: 12px; color: #718096; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{NOME_EVENTO}}</h1>
        <p style="margin: 10px 0 0 0; font-size: 1.1rem;">📅 {{DATA_ORA_EVENTO}}</p>
    </div>
    <div class="content">
        <p>Ciao <strong>{{NOME_PARTECIPANTE}}</strong>,</p>
        <p>Grazie per la tua registrazione! Ecco i tuoi biglietti:</p>
        {{TICKETS_HTML}}
        <p>Conserva questa email e mostra il QR code all'ingresso.</p>
    </div>
    <div class="footer">
        <p>{{NOME_EVENTO}} - {{EMAIL_MITTENTE}}</p>
    </div>
</body>
</html>
```

### Versione Avanzata con Data
```html
<html>
<head>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            margin: 0;
            padding: 0;
            background: #f7fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2rem;
        }
        .event-date {
            background: rgba(255, 255, 255, 0.2);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            margin-top: 10px;
            font-size: 1rem;
        }
        .content {
            padding: 30px 20px;
        }
        .greeting {
            font-size: 1.2rem;
            margin-bottom: 20px;
        }
        .footer {
            background: #edf2f7;
            padding: 20px;
            text-align: center;
            font-size: 0.9rem;
            color: #718096;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{NOME_EVENTO}}</h1>
            <div class="event-date">📅 {{DATA_ORA_EVENTO}}</div>
        </div>
        <div class="content">
            <p class="greeting">Ciao <strong>{{NOME_PARTECIPANTE}}</strong>! 👋</p>
            <p>Sei ufficialmente registrato/a per <strong>{{NOME_EVENTO}}</strong>!</p>
            <p>Di seguito trovi {{NUM_BIGLIETTI}} biglietto/i con QR code individuale.</p>
            
            {{TICKETS_HTML}}
            
            <p style="margin-top: 30px;">
                <strong>📱 Come accedere all'evento:</strong><br>
                1. Conserva questa email<br>
                2. Mostra il QR code all'ingresso<br>
                3. Ogni partecipante ha il proprio QR code
            </p>
        </div>
        <div class="footer">
            <p><strong>{{NOME_EVENTO}}</strong></p>
            <p>Per informazioni: {{EMAIL_MITTENTE}}</p>
        </div>
    </div>
</body>
</html>
```

---

## 🔧 Come Aggiornare il Template

### SQL Query
```sql
UPDATE eventi
SET email_body_template = '
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { background: #3182ce; color: white; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{NOME_EVENTO}}</h1>
        <p>📅 {{DATA_ORA_EVENTO}}</p>
    </div>
    <div style="padding: 20px;">
        <p>Ciao <strong>{{NOME_PARTECIPANTE}}</strong>,</p>
        {{TICKETS_HTML}}
    </div>
</body>
</html>
'
WHERE id = 1;
```

---

**Note**:
- I placeholder sono case-sensitive
- `{{TICKETS_HTML}}` viene già sostituito con HTML formattato (non serve ulteriore styling)
- Se `data_ora_evento` è NULL, `{{DATA_ORA_EVENTO}}` sarà una stringa vuota
