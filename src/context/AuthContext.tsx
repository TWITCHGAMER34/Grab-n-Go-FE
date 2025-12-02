import { createContext, useContext, useEffect, useState } from 'react';
import type {ReactNode} from 'react';
import axios from 'axios';

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isLoggedIn: boolean;
    register: (username: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`);
                setUser(response.data.user);
                console.log(user);
            } catch (error) {
                console.error('Error in getUserData:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        const checkSession = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/check-session`);
                setUser(response.data.user);
                await getUserData();
            } catch (error) {
                console.error('Error in checkSession:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const register = async (username: string, email: string, password: string) => {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {username, email, password});
        console.log('register response:', response.data);
        setUser(response.data.user);
    }

    const login = async (email: string, password: string) => {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {email, password});
        console.log('login response:', response.data);
        setUser(response.data.user);
    };

    const logout = async () => {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`);
        setUser(null);
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
