export const CONFIG = {
    API_BASE: window.location.hostname === 'localhost'
        ? 'http://localhost:8888/api'
        : 'https://poetic-phoenix-66e16b.netlify.app/api',
    DEFAULTS: {
        PRICES: { adulto: 10, ragazzo: 5, minore: 0 },
        LABELS: {
            'adulto': 'Maggiore 18 anni',
            'ragazzo': 'Tra 12 e 18 anni',
            'minore': 'Minore 12 anni'
        }
    }
};
