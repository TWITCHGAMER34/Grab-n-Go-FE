// File: `src/components/navbar/NavBar.tsx` (TypeScript)
import { NavLink } from 'react-router-dom';
import styles from './navbar.module.scss';
import { ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';

type NavKey = 'home' | 'menu' | 'orders' | 'about';

export default function Navbar({ active }: { active?: NavKey }) {
    const isLinkActive = (key: NavKey, isActiveFromNavLink: boolean) =>
        active ? active === key : isActiveFromNavLink;

    const { totalItems } = useCart(); // total number of items (sum of qty)

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbar__left}>
                <div className={styles.logoWrap}>
                    <div className={styles.logoWrap__logoCircle}>G</div>
                    <div className={styles.logoWrap__brand}>Grab 'n' Go</div>
                </div>
            </div>

            <ul className={styles.navbar__center}>
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isLinkActive('home', isActive)
                                ? `${styles.navbar__center__link} ${styles.active}`
                                : styles.navbar__center__link
                        }
                    >
                        Hem
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/menu"
                        className={({ isActive }) =>
                            isLinkActive('menu', isActive)
                                ? `${styles.navbar__center__link} ${styles.active}`
                                : styles.navbar__center__link
                        }
                    >
                        Meny
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/orders"
                        className={({ isActive }) =>
                            isLinkActive('orders', isActive)
                                ? `${styles.navbar__center__link} ${styles.active}`
                                : styles.navbar__center__link
                        }
                    >
                        Mina Beställningar
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            isLinkActive('about', isActive)
                                ? `${styles.navbar__center__link} ${styles.active}`
                                : styles.navbar__center__link
                        }
                    >
                        Om oss
                    </NavLink>
                </li>
            </ul>

            <div className={styles.right}>
                <NavLink to='/login' className={styles.right__login}>Logga in</NavLink>

                <NavLink
                    to="/basket"
                    className={styles.right__basketBtn}
                    aria-label={`Öppna kundvagn (${totalItems} artiklar)`}
                >
                    <span className={styles.right__basketIcon}>
                        <ShoppingBag />
                    </span>

                    {totalItems > 0 && (
                        <span className={styles.right__badge} aria-hidden="false">
                            {totalItems}
                        </span>
                    )}
                </NavLink>

                <div className={styles.right__userPill}>
                    <span className={styles.right__userIcon}>
                        <User />
                    </span>
                    <span className={styles.right__userText}>Personal</span>
                </div>
            </div>
        </nav>
    );
}
