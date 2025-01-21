import React, { createContext, useState, useContext, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    const [alertBox, setAlertBox] = useState({ show: false, message: '', type: 'success' });

    const updateAlertBox = (message, type) => {

        setAlertBox({ show: true, message: message, type: type });

        setTimeout(() => {
            setAlertBox({ show: false, message: '', type: 'success' });
        }, 4000);
    }

    const login = useCallback((newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);
    const value = {
        token,
        user,
        login,
        logout,
        alertBox,
        updateAlertBox,
        fetchWithToken: useCallback(async (url, options = {}) => {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            const response = await fetch(url, { ...options, headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }, [token]),

    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};