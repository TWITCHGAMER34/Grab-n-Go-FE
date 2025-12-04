// File: `src/components/navbar/NavBrand.tsx`
import styles from './navbar.module.scss';

export default function NavBrand() {
    return (
        <div className={styles['navbar__left']}>
            <div className={styles['navbar__logo-wrap']}>
                <div className={styles['navbar__logo-circle']}>G</div>
                <div className={styles['navbar__brand']}>Grab 'n' Go</div>
            </div>
        </div>
    );
}
