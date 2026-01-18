// Debug environment variables
console.log('Environment Debug:', {
    MODE: import.meta.env.MODE,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    BASE_URL: import.meta.env.BASE_URL
});

let API_BASE = import.meta.env.VITE_API_URL || '/api';

// Handle protocol-less Render URLs or internal service names
if (API_BASE !== '/api') {
    if (!API_BASE.startsWith('http')) {
        // If it looks like a Render service name (no dots), append .onrender.com
        if (!API_BASE.includes('.')) {
            console.warn(`Auto-correcting Render service name: "${API_BASE}" -> "${API_BASE}.onrender.com"`);
            API_BASE = `https://${API_BASE}.onrender.com`;
        } else {
            // Has dots, just prepend https://
            API_BASE = `https://${API_BASE}`;
        }
    }
}

console.log('Final API_BASE:', API_BASE);

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    console.log(`Making request to: ${url}`);

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include'
    };

    try {
        const response = await fetch(url, config);

        const text = await response.text();
        let data = {};

        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('Failed to parse response JSON:', e, 'Response text:', text.substring(0, 100));
        }

        if (!response.ok) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
}

const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};

export default api;
