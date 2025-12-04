// File: `src/components/navbar/NavBar.tsx`
import type { NavKey } from '../../types/navigation';
import styles from './navbar.module.scss';
import NavBrand from './NavBrand';
import NavCenter from './NavCenter';
import NavActions from './NavActions';

export default function Navbar({ active }: { active?: NavKey }) {
    return (
        <nav className={styles['navbar']}>
            <NavBrand />
            <NavCenter active={active} />
            <NavActions />
        </nav>
    );
}
