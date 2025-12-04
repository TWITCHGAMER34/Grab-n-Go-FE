// File: src/pages/auth/login/LoginPage.tsx
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../../context/AuthContext';
import Navbar from "../../../components/navbar";
import LoginForm from './LoginForm';
import './login.scss';

export default function LoginPage() {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async ({email, password}: { email: string; password: string }) => {
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar/>
            <main className="auth-page">
                <div className="auth-page__card">
                    <h1 className="auth-page__title">Logga in</h1>
                    <LoginForm loading={loading} error={error} onSubmit={handleSubmit}/>
                </div>
            </main>
        </>
    );
}
