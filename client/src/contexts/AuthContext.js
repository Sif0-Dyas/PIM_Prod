import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Attach token to every request
    useEffect(() => {
        const interceptor = axios.interceptors.request.use((config) => {
            const token = localStorage.getItem('pim_token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
        return () => axios.interceptors.request.eject(interceptor);
    }, []);

    // Auto-logout on 401
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (res) => res,
            (err) => {
                if (err.response?.status === 401 && localStorage.getItem('pim_token')) {
                    logout();
                }
                return Promise.reject(err);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const fetchMe = useCallback(async () => {
        try {
            const data = await authService.getMe();
            setUser(data.user);
        } catch {
            localStorage.removeItem('pim_token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (localStorage.getItem('pim_token')) {
            fetchMe();
        } else {
            setLoading(false);
        }
    }, [fetchMe]);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        localStorage.setItem('pim_token', data.token);
        setUser(data.user);
        return data;
    };

    const register = async (email, password, name) => {
        const data = await authService.register(email, password, name);
        localStorage.setItem('pim_token', data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('pim_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
