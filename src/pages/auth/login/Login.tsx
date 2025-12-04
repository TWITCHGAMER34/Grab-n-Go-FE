// File: `src/pages/auth/login/Login.tsx`
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import './login.scss';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const form = e.target as HTMLFormElement;
        const fd = new FormData(form);
        const email = String(fd.get('email') || '');
        const password = String(fd.get('password') || '');
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
        <main className="auth-page">
            <div className="auth-card">
                <h1>Logga in</h1>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                        <label>
                            Email
                            <input name="email" type="email" required disabled={loading} />
                        </label>
                    </div>

                    <div className="form-row">
                        <label>
                            Password
                            <input name="password" type="password" required disabled={loading} />
                        </label>
                    </div>

                    <p>Don´t have an account? Register <Link to={"/register"}>Here</Link></p>

                    {error && <div className="error-text" role="alert">{error}</div>}

                    <div className="actions">
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Loggar in…' : 'Logga in'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
