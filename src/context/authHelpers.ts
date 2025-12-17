import axios from 'axios'
import type { User } from './AuthContext';

axios.defaults.withCredentials = true;


export const register = async (name: string, email: string, phone: string, password: string) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { name, email, phone, password});
        return response.data;
    } catch (err) {
        console.error('Registration failed:', err);
        throw err;
    }
}

export const checkSession = async (setUser: (user: User | null) => void, setLoading: (loading: boolean) => void) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/check-session`);
        setUser(response.data.user);
    } catch (err) {
        console.error('Session check failed:', err);
        setUser(null);
    } finally {
        setLoading(false);
    }
}

/**
 * login
 *
 * Accepts `setUser` and optional `setLoading`. If the server doesn't return a user,
 * fall back to `checkSession` so cookie/session based auth is properly picked up.
 */
export const login = async (
    email: string,
    password: string,
    setUser: (user: User | null) => void,
    setLoading?: (loading: boolean) => void
) => {
    try {
        if (setLoading) setLoading(true);

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });

        if (response?.data?.user) {
            setUser(response.data.user);
            return response.data.user;
        }

        // Fallback to re-checking session (cookies) if the login response didn't include a user
        await checkSession(setUser, setLoading ?? (() => {}));
        return null;
    }
    catch (err) {
        console.error('Login failed:', err);
        throw err;
    } finally {
        if (setLoading) setLoading(false);
    }
};

export const staffLogin = async (
    email: string,
    password: string,
    setUser: (user: User | null) => void,
    setLoading?: (loading: boolean) => void
) => {
    try {
        if (setLoading) setLoading(true);

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/staff/login`, { email, password });

        if (response?.data?.user) {
            setUser(response.data.user);
            return response.data.user;
        }

        // Fallback to re-checking session (cookies) if the login response didn't include a user
        await checkSession(setUser, setLoading ?? (() => {}));
        return null;
    }
    catch (err) {
        console.error('Staff Login failed:', err);
        throw err;
    } finally {
        if (setLoading) setLoading(false);
    }
};

/**
 * logout
 *
 * Invalidate the session on the server and clear local auth state regardless of outcome.
 */
export const logout = async () => {
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`);
    } catch (err) {
        console.error('Logout failed:', err);
        throw err;
    }
};
