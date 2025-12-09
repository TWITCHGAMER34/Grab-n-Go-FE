// File: src/pages/staff/login/StaffLogin.tsx
import { useState } from 'react';
import styles from './StaffLogin.module.scss';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function StaffLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { staffLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await staffLogin(email, password);
            // on success, navigate to staff area (adjust path if needed)
            navigate('/staff/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || err?.message || 'Login failed');
        }
    };

    return (
        <div className={styles['staff-login']}>
            <div className={styles['staff-login__top']}>
                <div className={styles['staff-login__logo']}>G</div>
                <div className={styles['staff-login__brand']}>Grab ’n’ Go</div>
                <div className={styles['staff-login__subtitle']}>Personalportalen</div>
                <Link to="/" className={styles['staff-login__back-link']}>
                    <ArrowLeft/> Tillbaka till startsidan
                </Link>
            </div>

            <div className={styles['staff-login__card']}>
                <h2 className={styles['staff-login__title']}>Logga in</h2>

                <form
                    className={styles['staff-login__form']}
                    onSubmit={handleSubmit}
                >
                    <div>
                        <label className={styles['staff-login__label']}>E-Mail</label>
                        <div className={styles['staff-login__field']}>
              <span className={styles['staff-login__icon']}>
                <User />
              </span>
                            <input
                                className={styles['staff-login__input']}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Ange E-Mail"
                                aria-label="E-Mail"
                                type={'email'}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={styles['staff-login__label']}>Lösenord</label>
                        <div className={styles['staff-login__field']}>
              <span className={styles['staff-login__icon']}>
                <Lock />
              </span>
                            <input
                                className={styles['staff-login__input']}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ange Lösenord"
                                aria-label="Lösenord"
                            />
                        </div>
                    </div>

                    {error && <div style={{ color: 'crimson', fontSize: 13 }}>{error}</div>}

                    <button type="submit" className={styles['staff-login__button']}>
                        Logga in
                    </button>

                    <div className={styles['staff-login__note']}>
                        Endast behörig personal har tillgång till denna sida
                    </div>
                </form>
            </div>
        </div>
    );
}