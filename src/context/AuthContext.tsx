// File: `src/context/AuthContext.tsx`
/**
 * Authentication context and provider
 *
 * - Exposes `user`, `loading`, `isLoggedIn`, `isStaffLoggedIn` and auth actions.
 * - Uses cookie-based auth via `axios` with `withCredentials: true`.
 * - Fetches the current user on mount and keeps a minimal `User` shape in state.
 *
 */
import {createContext, useContext, useEffect, useState} from 'react';
import {checkSession, login, logout as logoutHelper, register, staffLogin} from "./authHelpers.ts";
import type { ReactNode } from 'react';

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
    register: (name: string, email: string, password: string, phone: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    staffLogin: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider
 *
 * Wrap the application with this provider to grant access to auth state and actions.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Current authenticated user or null when not authenticated
    const [user, setUser] = useState<User | null>(null);
    // Loading flag used while fetching current user or performing auth actions
    const [loading, setLoading] = useState(true);
    // Convenience boolean to indicate staff role

    useEffect(() => {
        checkSession(setUser, setLoading);
    }, [])

    const logout = async () => {
        await logoutHelper();
        setUser(null);
    }


    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isLoggedIn: !!user,
            isStaffLoggedIn: user?.role === 'staff' || false,
            register: (name: string, email: string, password: string, phone: string)=> register(name, email, password, phone),
            login: (email: string, password: string) => login(email, password, setUser),
            staffLogin: (email: string, password: string) => staffLogin(email, password, setUser),
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * useAuth
 *
 * Hook to access auth context. Throws if used outside the `AuthProvider`.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
