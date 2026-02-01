import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, removeToken, getToken } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Validate stored auth data
const validateAuthData = (data) => {
    if (!data || typeof data !== 'object') return false;
    if (!data.email || typeof data.email !== 'string') return false;
    return true;
};

export const AuthProvider = ({ children }) => {
    // Initialize from localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            return !!(localStorage.getItem('adminUser') && getToken());
        } catch {
            return false;
        }
    });

    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('adminUser');
            if (stored) {
                const data = JSON.parse(stored);
                return validateAuthData(data) ? data : null;
            }
        } catch {
            return null;
        }
        return null;
    });

    const [isLoading, setIsLoading] = useState(false);

    // Verify session on mount
    useEffect(() => {
        const verifySession = () => {
            try {
                const stored = localStorage.getItem('adminUser');
                const token = getToken();

                if (stored && token) {
                    const data = JSON.parse(stored);
                    if (validateAuthData(data)) {
                        setUser(data);
                        setIsAuthenticated(true);
                        return;
                    }
                }

                // No valid session
                setIsAuthenticated(false);
                setUser(null);
            } catch (error) {
                console.error('Session verification error:', error);
                setIsAuthenticated(false);
                setUser(null);
            }
        };

        verifySession();

        // Listen for storage changes (other tabs)
        const handleStorageChange = (e) => {
            if (e.key === 'adminUser' || e.key === 'token') {
                verifySession();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = useCallback(async (credentials) => {
        setIsLoading(true);
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

            if (response.accessToken) {
                setToken(response.accessToken);

                const userData = {
                    id: response.id || response.userId,
                    username: response.username || credentials.email.split('@')[0],
                    name: response.name || `${response.firstName || ''} ${response.lastName || ''}`.trim() || 'Admin',
                    email: response.email || credentials.email,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    role: response.roles?.includes('ROLE_ADMIN') ? 'administrator' : 'user',
                    roles: response.roles || [],
                };

                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('adminUser', JSON.stringify(userData));

                return { success: true };
            }

            return { success: false, message: 'Invalid response from server' };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed. Please try again.',
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        removeToken();
        localStorage.removeItem('adminUser');
    }, []);

    const updateUser = useCallback((updates) => {
        setUser((prev) => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('adminUser', JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Check if user has admin role
    const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.role === 'administrator';

    const value = {
        isAuthenticated,
        user,
        isLoading,
        isAdmin,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
