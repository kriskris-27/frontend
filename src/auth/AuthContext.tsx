import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

interface User {
    id: string;
    email: string;
    role: string;
}

interface MeResponse {
    user: User;
}

interface LoginResponse {
    message: string;
    user?: User;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    refetchUser: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetchUser = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<MeResponse>('/auth/me');
            if (res.data.user) {
                setUser(res.data.user);
                // Store minimal user info in localStorage as backup
                localStorage.setItem('user', JSON.stringify({
                    id: res.data.user.id,
                    email: res.data.user.email,
                    role: res.data.user.role
                }));
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
        } catch (error: any) {
            setUser(null);
            localStorage.removeItem('user');
            setError(error.response?.data?.message || 'Failed to fetch user data');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Try to get user from cookie first
                await refetchUser();
            } catch (error) {
                console.error('Initial auth check failed:', error);
                // Clear any stale data
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post<LoginResponse>('/auth/login', { email, password });
            if (response.data.user) {
                setUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            } else {
                // If user data isn't in login response, fetch it
                await refetchUser();
            }
        } catch (error: any) {
            setUser(null);
            localStorage.removeItem('user');
            setError(error.response?.data?.message || 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await api.post('/auth/logout');
            setUser(null);
            localStorage.removeItem('user');
        } catch (error: any) {
            console.error('Logout error:', error);
            // Still clear local state even if server request fails
            setUser(null);
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refetchUser, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};