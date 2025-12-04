// typescript
// File: `src/context/AuthContext.tsx`
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isLoggedIn: boolean;
    register: (name: string, email: string, phone: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper to fetch current user from the backend and update context
    const fetchCurrentUser = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`);
            setUser(response.data?.user ?? null);
        } catch (error) {
            console.error('Error fetching current user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // On mount, fetch current user/session
        void fetchCurrentUser();
    }, []);

    const register = async (name: string, email: string, phone: string, password: string) => {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { name, email, phone, password });
        // If server returns the user directly, use it; otherwise refresh
        if (response.data?.user) {
            setUser(response.data.user);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
        // If server returns the user directly, use it; otherwise refresh
        if (response.data?.user) {
            setUser(response.data.user);
        } else {
            await fetchCurrentUser();
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`);
        } finally {
            // Ensure context is cleared immediately
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isLoggedIn: !!user,
            login,
            logout,
            register
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
