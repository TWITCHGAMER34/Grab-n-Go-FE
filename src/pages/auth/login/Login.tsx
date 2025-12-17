// File: src/pages/auth/login/LoginPage.tsx
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../../context/AuthContext';
import Navbar from "../../../components/navbar";
import './login.scss';
import Seo from "../../../components/Seo.tsx";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {login} = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err?.response?.data?.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Seo title="Log in" description="Log in to your account"/>
            <Navbar/>
            <main className="auth-page">
                <div className="auth-page__card">
                    <h1 className="auth-page__title">Logga in</h1>
                    <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
                        <div className="auth-page__form-row">
                            <label>
                                E-Mail: *
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    disabled={loading}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </label>
                        </div>

                        <div className="auth-page__form-row">
                            <label>
                                Lösenord: *
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    disabled={loading}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </label>
                        </div>

                        <p className="auth-page__helper">
                            Har du inget konto? Klicka <Link to="/register">här</Link>
                        </p>

                        {error && (
                            <div className="auth-page__error-text" role="alert">
                                {error.trim()}
                            </div>
                        )}

                        <div className="auth-page__actions">
                            <button type="submit" className="auth-page__submit-btn" disabled={loading}>
                                {loading ? 'Loggar in…' : 'Logga in'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
