const { createClient } = require('@supabase/supabase-js');

// Inizializziamo il client con le variabili d'ambiente che hai impostato su Netlify
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase };
