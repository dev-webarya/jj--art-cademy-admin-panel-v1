// ============================================
// API SERVICE - HTTP Client with JWT handling
// ============================================

import { BASE_URL } from './endpoints';

/**
 * Get stored JWT token
 */
export const getToken = () => localStorage.getItem('token');

/**
 * Set JWT token
 */
export const setToken = (token) => localStorage.setItem('token', token);

/**
 * Remove JWT token
 */
export const removeToken = () => localStorage.removeItem('token');

/**
 * API Request wrapper with authentication
 * @param {string} endpoint - API endpoint (relative path)
 * @param {Object} options - Fetch options
 * @returns {Promise} - Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        // Handle 401 Unauthorized
        if (response.status === 401) {
            // Token expired or invalid - clear and redirect to login
            removeToken();
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return { success: true };
        }

        // Try to parse JSON response
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Handle error responses
        if (!response.ok) {
            const error = new Error(data.message || data.error || 'Request failed');
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (error) {
        // Re-throw with additional context
        if (error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
};

/**
 * HTTP Methods shortcuts
 */
export const api = {
    get: (endpoint, options = {}) =>
        apiRequest(endpoint, { method: 'GET', ...options }),

    post: (endpoint, body, options = {}) =>
        apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            ...options
        }),

    put: (endpoint, body, options = {}) =>
        apiRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
            ...options
        }),

    patch: (endpoint, body, options = {}) =>
        apiRequest(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
            ...options
        }),

    delete: (endpoint, options = {}) =>
        apiRequest(endpoint, { method: 'DELETE', ...options }),
};

/**
 * Build query string from params object
 * @param {Object} params - Query parameters
 * @returns {string} - Query string
 */
export const buildQueryString = (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.append(key, value);
        }
    });
    return query.toString() ? `?${query.toString()}` : '';
};

/**
 * Paginated GET request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query params (page, size, etc.)
 * @returns {Promise} - Paginated response
 */
export const getPaginated = async (endpoint, params = {}) => {
    const { page = 0, size = 20, ...rest } = params;
    const queryString = buildQueryString({ page, size, ...rest });
    return api.get(`${endpoint}${queryString}`);
};

export default api;
