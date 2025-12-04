// File: `src/components/navbar/NavCenter.tsx`
import { NavLink } from 'react-router-dom';
import styles from './navbar.module.scss';
import navItems from './navItems';
import useNavActive from '../../hooks/useNavActive';
import type { NavKey } from '../../types/navigation';

export default function NavCenter({ active }: { active?: NavKey }) {
    const isLinkActive = useNavActive(active);

    return (
        <ul className={styles['navbar__center']}>
            {navItems.map(({ key, to, label }) => (
                <li key={key}>
                    <NavLink
                        to={to}
                        className={({ isActive }) =>
                            isLinkActive(key, isActive)
                                ? `${styles['navbar__link']} ${styles['active']}`
                                : styles['navbar__link']
                        }
                    >
                        {label}
                    </NavLink>
                </li>
            ))}
        </ul>
    );
}
