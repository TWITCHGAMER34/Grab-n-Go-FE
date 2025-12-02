import styles from './Footer.module.scss';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <h2 className={styles.footer__title}>Hungrig? Beställ nu!</h2>
            <p className={styles.footer__text}>Enkel online-beställning. Snabb hämtning. Fantastisk mat.</p>
            <button className={styles.footer__button}>Börja beställa</button>
        </footer>
    );
}