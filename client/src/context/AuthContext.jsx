import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const response = await api.get('/auth/me');
            setUser(response.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        setUser(response.user);
        return response;
    }

    async function loginWithGoogle(credential) {
        const response = await api.post('/auth/google', { credential });
        setUser(response.user);
        return response;
    }

    async function register(email, password) {
        const response = await api.post('/auth/register', { email, password });
        setUser(response.user);
        return response;
    }

    async function logout() {
        await api.post('/auth/logout');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
