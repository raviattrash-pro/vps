import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from './config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('vps_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (admissionNo, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admissionNo, password })
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
                localStorage.setItem('vps_user', JSON.stringify(data));
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('vps_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
