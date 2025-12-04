// File: `src/components/navbar/NavActions.tsx`
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import styles from './navbar.module.scss';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function NavActions() {
    const { totalItems } = useCart();
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await logout();
            navigate('/');
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <div className={styles['navbar__right']}>
            {isLoggedIn ? (
                <button
                    type="button"
                    className={styles['navbar__right-login']}
                    onClick={handleLogout}
                    disabled={loggingOut}
                >
                    {loggingOut ? 'Loggar ut…' : 'Logga ut'}
                </button>
            ) : (
                <NavLink to="/login" className={styles['navbar__right-login']}>
                    Logga in
                </NavLink>
            )}

            <NavLink
                to="/basket"
                className={styles['navbar__right-basket-btn']}
                aria-label={`Öppna kundvagn (${totalItems} artiklar)`}
            >
        <span className={styles['navbar__right-basket-icon']}>
          <ShoppingBag />
        </span>

                {totalItems > 0 && (
                    <span className={styles['navbar__right-badge']} aria-hidden="false">
            {totalItems}
          </span>
                )}
            </NavLink>

            <div className={styles['navbar__right-user-pill']}>
        <span className={styles['navbar__right-user-icon']}>
          <User />
        </span>
                <span className={styles['navbar__right-user-text']}>Personal</span>
            </div>
        </div>
    );
}
