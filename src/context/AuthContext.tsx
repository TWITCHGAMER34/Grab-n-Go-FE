// File: `src/context/AuthContext.tsx`
/**
 * Authentication context and provider
 *
 * - Exposes `user`, `loading`, `isLoggedIn`, `isStaffLoggedIn` and auth actions.
 * - Uses cookie-based auth via `axios` with `withCredentials: true`.
 * - Fetches the current user on mount and keeps a minimal `User` shape in state.
 *
 */
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
    const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);

    /**
     * updateUserState
     *
     * Centralized updater to set `user` and derived `isStaffLoggedIn`.
     * Ensures role changes are reflected consistently across the provider.
     */
    const updateUserState = (u: User | null) => {
        setUser(u);
        setIsStaffLoggedIn(!!u && u.role === 'staff');
    };

    /**
     * fetchCurrentUser
     *
     * Retrieve the currently authenticated user from the backend.
     * Uses `withCredentials` so server-side session cookies are sent.
     * On failure, clears the user state.
     */
    const fetchCurrentUser = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, { withCredentials: true });
            // Some backends wrap the user under `data.user`; tolerate missing fields.
            updateUserState(response.data?.user ?? null);
        } catch (error) {
            // Keep logging minimal but useful for debugging auth failures.
            console.error('Error fetching current user:', error);
            updateUserState(null);
        } finally {
            setLoading(false);
        }
    };

    // Fetch the current user on provider mount.
    useEffect(() => {
        void fetchCurrentUser();
    }, []);

    /**
     * register
     *
     * Register a new user and update local state when the backend returns the created user.
     */
    const register = async (name: string, email: string, phone: string, password: string) => {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/register`,
            { name, email, phone, password },
            { withCredentials: true }
        );
        if (response.data?.user) {
            updateUserState(response.data.user);
        }
    };

    /**
     * login
     *
     * Log in a customer. If the server returns a user object use it; otherwise
     * re-fetch the current user (some endpoints rely on session cookies only).
     */
    const login = async (email: string, password: string) => {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/login`,
            { email, password },
            { withCredentials: true }
        );

        if (response.data?.user) {
            updateUserState(response.data.user);
        } else {
            // Some backends may not return the user; ensure state is synchronized.
            await fetchCurrentUser();
        }
    };

    /**
     * staffLogin
     *
     * Staff-specific login flow. Errors are propagated after logging for visibility.
     */
    const staffLogin = async (email: string, password: string) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/staff/login`,
                { email, password },
                { withCredentials: true }
            );
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

    /**
     * logout
     *
     * Invalidate the session on the server and clear local auth state regardless of outcome.
     */
    const logout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
        } finally {
            // Ensure local state is cleared even if the network call fails.
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
