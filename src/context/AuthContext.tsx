// File: src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

export interface User {
    id: string;
    name: string;
    email?: string;
    password?: string;
    phone?: string;
    username?: string;
    role: 'customer' | 'staff' | string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isLoggedIn: boolean;
    isStaffLoggedIn: boolean;
    register: (name: string, email: string, phone: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    staffLogin: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);

    const updateUserState = (u: User | null) => {
        setUser(u);
        setIsStaffLoggedIn(!!u && u.role === 'staff');
    };

    const fetchCurrentUser = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, { withCredentials: true });
            updateUserState(response.data?.user ?? null);
        } catch (error) {
            console.error('Error fetching current user:', error);
            updateUserState(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchCurrentUser();
    }, []);

    const register = async (name: string, email: string, phone: string, password: string) => {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { name, email, phone, password }, { withCredentials: true });
        if (response.data?.user) {
            updateUserState(response.data.user);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password }, { withCredentials: true });
        if (response.data?.user) {
            updateUserState(response.data.user);
        } else {
            await fetchCurrentUser();
        }
    };

    const staffLogin = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/staff/login`, { email, password }, { withCredentials: true });
            if (response.data?.user) {
                updateUserState(response.data.user);
            } else {
                await fetchCurrentUser();
            }
        } catch (error) {
            console.error('Staff login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
        } finally {
            updateUserState(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isLoggedIn: !!user,
            isStaffLoggedIn,
            login,
            logout,
            register,
            staffLogin,
        }}>
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