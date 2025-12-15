// File: `src/components/navbar/NavCenter.tsx`
import { NavLink } from 'react-router-dom';
import styles from './navbar.module.scss';
import navItems from './navItems';
import useNavActive from '../../hooks/useNavActive';
import type { NavKey } from '../../types/navigation';

/**
 * NavCenter
 *
 * Renders the center section of the navigation bar as a list of links.
 * Uses `useNavActive` hook to decide whether a link should appear active.
 *
 * Props:
 * - `active` (optional): a `NavKey` override to force a specific item active.
 */
export default function NavCenter({ active }: { active?: NavKey }) {
    // Hook returns a helper that accepts the item's key and the router `isActive`
    // value and returns whether the item should be styled as active.
    const isLinkActive = useNavActive(active);

    return (
        <ul className={styles['navbar__center']}>
            {navItems.map(({ key, to, label }) => (
                // Each list item represents one navigation target from `navItems`.
                <li key={key}>
                    <NavLink
                        to={to}
                        // `className` receives router's `isActive`. Combine it with the
                        // local active decision (which may consider the `active` prop).
                        className={({ isActive }) =>
                            isLinkActive(key, isActive)
                                ? `${styles['navbar__link']} ${styles['active']}`
                                : styles['navbar__link']
                        }
                    >
                        {/* Visible label for the link */}
                        {label}
                    </NavLink>
                </li>
            ))}
        </ul>
    );
}
