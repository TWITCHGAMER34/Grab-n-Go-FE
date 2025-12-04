// File: src/pages/auth/login/LoginForm.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

type Props = {
    loading: boolean;
    error: string | null;
    onSubmit: (creds: { email: string; password: string }) => void;
};

export default function LoginForm({ loading, error, onSubmit }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ email: String(email).trim(), password: String(password) });
    };

    return (
        <form className="auth-page__form" onSubmit={submit} noValidate>
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
                    {error}
                </div>
            )}

            <div className="auth-page__actions">
                <button type="submit" className="auth-page__submit-btn" disabled={loading}>
                    {loading ? 'Loggar in…' : 'Logga in'}
                </button>
            </div>
        </form>
    );
}
