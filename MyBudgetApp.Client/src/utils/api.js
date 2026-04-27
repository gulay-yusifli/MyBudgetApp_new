const API_BASE_URL = 'http://localhost:5001/api';

export async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export async function getTransactions(filter = {}) {
    const params = new URLSearchParams();
    if (filter.period) params.append('period', filter.period);
    if (filter.categoryId) params.append('categoryId', filter.categoryId);

    return fetchWithAuth(`/transactions?${params}`);
}

export async function getCategories() {
    return fetchWithAuth('/categories');
}

export async function createTransaction(data) {
    return fetchWithAuth('/transactions', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}