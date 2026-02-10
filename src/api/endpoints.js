// ============================================
// ART ACADEMY ADMIN PANEL - API ENDPOINTS
// Complete API Configuration from OpenAPI Docs
// ============================================

// Use empty base URL for Vite proxy (proxy forwards /api to http://localhost:8095)
// For production, set this to your backend URL
export const BASE_URL = '';
export const API_PREFIX = '/api/v1';

/**
 * Helper function to build full URL
 */
export const buildUrl = (endpoint) => `${BASE_URL}${endpoint}`;

/**
 * Complete API Endpoints Configuration
 * Strictly follows OpenAPI specification
 */
export const API_ENDPOINTS = {
    // ============================================
    // AUTHENTICATION
    // ============================================
    AUTH: {
        LOGIN: `${API_PREFIX}/auth/login`,
        REGISTER: `${API_PREFIX}/auth/register`,
        DEV_REGISTER: `${API_PREFIX}/auth/dev-register`,
        REFRESH_TOKEN: `${API_PREFIX}/auth/refresh`,
        REQUEST_OTP: `${API_PREFIX}/auth/request-otp`,
        VERIFY_OTP: `${API_PREFIX}/auth/verify-otp`,
        VERIFY_LOGIN_OTP: `${API_PREFIX}/auth/verify-login-otp`,
        RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
    },

    // ============================================
    // USER MANAGEMENT
    // ============================================
    USERS: {
        GET_ALL: `${API_PREFIX}/users`, // GET with pageable
        CREATE: `${API_PREFIX}/users`, // POST
        CURRENT_USER: `${API_PREFIX}/users/me`, // GET
        UPDATE_CURRENT_USER: `${API_PREFIX}/users/me`, // PUT
        GET_BY_ID: (id) => `${API_PREFIX}/users/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/users/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/users/${id}`, // DELETE
    },

    // ============================================
    // LMS - ENROLLMENTS
    // ============================================
    ENROLLMENTS: {
        GET_ALL: `${API_PREFIX}/enrollments`, // GET with pageable (Admin)
        CREATE: `${API_PREFIX}/enrollments`, // POST - enroll
        MY_ENROLLMENTS: `${API_PREFIX}/enrollments/my-enrollments`, // GET
        GET_BY_ID: (id) => `${API_PREFIX}/enrollments/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/enrollments/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/enrollments/${id}`, // DELETE
        UPDATE_STATUS: (id) => `${API_PREFIX}/enrollments/${id}/status`, // PUT with status in body
        CANCEL: (id) => `${API_PREFIX}/enrollments/${id}/cancel`, // PUT
    },

    // ============================================
    // LMS - SUBSCRIPTIONS
    // ============================================
    SUBSCRIPTIONS: {
        GET_ALL: `${API_PREFIX}/lms/subscriptions`, // GET with page, size
        CREATE: `${API_PREFIX}/lms/subscriptions`, // POST
        GET_BY_ID: (id) => `${API_PREFIX}/lms/subscriptions/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/lms/subscriptions/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/lms/subscriptions/${id}`, // DELETE
        CANCEL: (id) => `${API_PREFIX}/lms/subscriptions/${id}/cancel`, // POST
        BY_STUDENT: (studentId) => `${API_PREFIX}/lms/subscriptions/student/${studentId}`, // GET
        ACTIVE_BY_STUDENT: (studentId) => `${API_PREFIX}/lms/subscriptions/student/${studentId}/active`, // GET
        OVER_LIMIT: `${API_PREFIX}/lms/subscriptions/over-limit`, // GET
        BY_MONTH: (year, month) => `${API_PREFIX}/lms/subscriptions/month/${year}/${month}`, // GET
        RENEW: (enrollmentId) => `${API_PREFIX}/lms/subscriptions/enrollment/${enrollmentId}/renew`, // POST
    },

    // ============================================
    // LMS - CLASS SESSIONS
    // ============================================
    SESSIONS: {
        GET_ALL: `${API_PREFIX}/lms/sessions`, // GET with pageable
        CREATE: `${API_PREFIX}/lms/sessions`, // POST
        GET_BY_ID: (id) => `${API_PREFIX}/lms/sessions/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/lms/sessions/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/lms/sessions/${id}`, // DELETE
        UPDATE_STATUS: (id) => `${API_PREFIX}/lms/sessions/${id}/status`, // PATCH with status, reason
    },

    // ============================================
    // LMS - ATTENDANCE
    // ============================================
    ATTENDANCE: {
        MARK: `${API_PREFIX}/lms/attendance`, // POST
        BY_SESSION: (sessionId) => `${API_PREFIX}/lms/attendance/session/${sessionId}`, // GET
        BY_STUDENT: (studentId) => `${API_PREFIX}/lms/attendance/student/${studentId}`, // GET with pageable
        MONTHLY: (studentId, year, month) => `${API_PREFIX}/lms/attendance/student/${studentId}/monthly/${year}/${month}`, // GET
        LOGS: (studentId, year, month) => {
            let url = `${API_PREFIX}/lms/attendance/student/${studentId}/logs`;
            const params = new URLSearchParams();
            if (year) params.append('year', year);
            if (month) params.append('month', month);
            const queryString = params.toString();
            return queryString ? `${url}?${queryString}` : url;
        },
        ELIGIBLE_STUDENTS: `${API_PREFIX}/lms/attendance/eligible-students`, // GET
    },

    // ============================================
    // LMS - EVENTS
    // ============================================
    EVENTS: {
        GET_ALL: `${API_PREFIX}/lms/events`, // GET with pageable
        CREATE: `${API_PREFIX}/lms/events`, // POST
        GET_BY_ID: (id) => `${API_PREFIX}/lms/events/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/lms/events/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/lms/events/${id}`, // DELETE
        UPCOMING: `${API_PREFIX}/lms/events/upcoming`, // GET
        PUBLIC: `${API_PREFIX}/lms/events/public`, // GET
        BY_TYPE: (eventType) => `${API_PREFIX}/lms/events/type/${eventType}`, // GET
    },

    // ============================================
    // ART WORKS
    // ============================================
    ART_WORKS: {
        GET_ALL: `${API_PREFIX}/art-works`, // GET with pageable
        CREATE: `${API_PREFIX}/art-works`, // POST
        GET_BY_ID: (id) => `${API_PREFIX}/art-works/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/art-works/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/art-works/${id}`, // DELETE
        INCREMENT_VIEWS: (id) => `${API_PREFIX}/art-works/${id}/views`, // POST
        INCREMENT_LIKES: (id) => `${API_PREFIX}/art-works/${id}/likes`, // POST
    },

    // ============================================
    // ART WORKS CATEGORIES
    // ============================================
    ART_WORKS_CATEGORIES: {
        GET_ALL: `${API_PREFIX}/art-works-categories`, // GET with pageable
        CREATE: `${API_PREFIX}/art-works-categories`, // POST
        GET_ROOT: `${API_PREFIX}/art-works-categories/root`, // GET
        GET_BY_ID: (id) => `${API_PREFIX}/art-works-categories/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/art-works-categories/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/art-works-categories/${id}`, // DELETE
    },

    // ============================================
    // ART MATERIALS
    // ============================================
    ART_MATERIALS: {
        GET_ALL: `${API_PREFIX}/art-materials`, // GET with pageable
        CREATE: `${API_PREFIX}/art-materials`, // POST
        GET_BY_ID: (id) => `${API_PREFIX}/art-materials/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/art-materials/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/art-materials/${id}`, // DELETE
    },

    // ============================================
    // ART MATERIALS CATEGORIES
    // ============================================
    ART_MATERIALS_CATEGORIES: {
        GET_ALL: `${API_PREFIX}/art-materials-categories`, // GET with pageable
        CREATE: `${API_PREFIX}/art-materials-categories`, // POST
        GET_ROOT: `${API_PREFIX}/art-materials-categories/root`, // GET
        GET_BY_ID: (id) => `${API_PREFIX}/art-materials-categories/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/art-materials-categories/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/art-materials-categories/${id}`, // DELETE
    },

    // ============================================
    // ART GALLERIES
    // ============================================
    ART_GALLERIES: {
        GET_ALL: `${API_PREFIX}/art-galleries`, // GET with pageable
        CREATE: `${API_PREFIX}/art-galleries`, // POST
        MY: `${API_PREFIX}/art-galleries/my`, // GET user's own galleries with ?status=PENDING|APPROVED|REJECTED
        GET_BY_ID: (id) => `${API_PREFIX}/art-galleries/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/art-galleries/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/art-galleries/${id}`, // DELETE
        VERIFY: (id) => `${API_PREFIX}/art-galleries/${id}/verify`, // PUT with ?status=APPROVED|REJECTED
    },

    // ============================================
    // ART GALLERIES CATEGORIES
    // ============================================
    ART_GALLERIES_CATEGORIES: {
        GET_ALL: `${API_PREFIX}/art-galleries-categories`, // GET with pageable
        CREATE: `${API_PREFIX}/art-galleries-categories`, // POST
        GET_ROOT: `${API_PREFIX}/art-galleries-categories/root`, // GET
        GET_BY_ID: (id) => `${API_PREFIX}/art-galleries-categories/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/art-galleries-categories/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/art-galleries-categories/${id}`, // DELETE
    },

    // ============================================
    // ART EXHIBITIONS
    // ============================================
    ART_EXHIBITIONS: {
        GET_ALL: `${API_PREFIX}/art-exhibitions`, // GET with pageable
        CREATE: `${API_PREFIX}/art-exhibitions`, // POST
        GET_BY_ID: (id) => `${API_PREFIX}/art-exhibitions/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/art-exhibitions/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/art-exhibitions/${id}`, // DELETE
    },

    // ============================================
    // ART EXHIBITIONS CATEGORIES
    // ============================================
    ART_EXHIBITIONS_CATEGORIES: {
        GET_ALL: `${API_PREFIX}/art-exhibitions-categories`, // GET with pageable
        CREATE: `${API_PREFIX}/art-exhibitions-categories`, // POST
        GET_ROOT: `${API_PREFIX}/art-exhibitions-categories/root`, // GET
        GET_BY_ID: (id) => `${API_PREFIX}/art-exhibitions-categories/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/art-exhibitions-categories/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/art-exhibitions-categories/${id}`, // DELETE
    },

    // ============================================
    // ART CLASSES
    // ============================================
    ART_CLASSES: {
        GET_ALL: `${API_PREFIX}/art-classes`, // GET with pageable
        CREATE: `${API_PREFIX}/art-classes`, // POST
        GET_BY_ID: (id) => `${API_PREFIX}/art-classes/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/art-classes/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/art-classes/${id}`, // DELETE
    },

    // ============================================
    // ART CLASSES CATEGORIES
    // ============================================
    ART_CLASSES_CATEGORIES: {
        GET_ALL: `${API_PREFIX}/art-classes-categories`, // GET with pageable
        CREATE: `${API_PREFIX}/art-classes-categories`, // POST
        GET_ROOT: `${API_PREFIX}/art-classes-categories/root`, // GET
        GET_BY_ID: (id) => `${API_PREFIX}/art-classes-categories/${id}`, // GET
        UPDATE: (id) => `${API_PREFIX}/art-classes-categories/${id}`, // PUT
        DELETE: (id) => `${API_PREFIX}/art-classes-categories/${id}`, // DELETE
    },

    // ============================================
    // ORDERS
    // ============================================
    ORDERS: {
        GET_ALL: `${API_PREFIX}/art-orders`, // GET with pageable
        CREATE: `${API_PREFIX}/art-orders`, // POST
        MY_ORDERS: `${API_PREFIX}/art-orders/my-orders`, // GET
        CHECKOUT: `${API_PREFIX}/art-orders/checkout`, // POST
        GET_BY_ID: (id) => `${API_PREFIX}/art-orders/${id}`, // GET
        UPDATE_STATUS: (id) => `${API_PREFIX}/art-orders/${id}/status`, // PUT with status, notes
        SHIP: (id) => `${API_PREFIX}/art-orders/${id}/ship`, // POST
        DELIVER: (id) => `${API_PREFIX}/art-orders/${id}/deliver`, // POST
    },

    // ============================================
    // CART
    // ============================================
    CART: {
        GET: `${API_PREFIX}/art-cart`, // GET
        CLEAR: `${API_PREFIX}/art-cart`, // DELETE
        ADD_ITEM: `${API_PREFIX}/art-cart/items`, // POST
        UPDATE_QUANTITY: (itemId) => `${API_PREFIX}/art-cart/items/${itemId}`, // PUT with quantity
        REMOVE_ITEM: (itemId) => `${API_PREFIX}/art-cart/items/${itemId}`, // DELETE
    },

    // ============================================
    // PAYMENTS
    // ============================================
    PAYMENTS: {
        INITIATE: `${API_PREFIX}/art-payments/initiate`, // POST
        VERIFY: `${API_PREFIX}/art-payments/verify`, // POST
        BY_ORDER: (orderId) => `${API_PREFIX}/art-payments/order/${orderId}`, // GET
    },
};

// ============================================
// ENUMS (from OpenAPI schemas)
// ============================================
export const ENROLLMENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS = {
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    RETURN_REQUESTED: 'RETURN_REQUESTED',
    RETURNED: 'RETURNED',
};

export const SESSION_STATUS = {
    SCHEDULED: 'SCHEDULED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED',
};

export const SCHEDULE_OPTIONS = [
    'WEEKDAY_MORNING',
    'WEEKDAY_AFTERNOON',
    'WEEKDAY_EVENING',
    'WEEKEND_MORNING',
    'WEEKEND_AFTERNOON',
];

export const EVENT_TYPES = [
    'WORKSHOP',
    'EXHIBITION',
    'COMPETITION',
    'GUEST_LECTURE',
    'FIELD_TRIP',
    'OTHER',
];

export default API_ENDPOINTS;
