import styles from './SmallCard.module.scss'
import type {SmallCardProps} from '../../types/smallCard';

export default function SmallCard({ icon, title, text }: SmallCardProps) {
    return (
        <div className={styles['small-card']}>
            {icon && <div className={styles['small-card__icon']}>{icon}</div>}
            {title && <h4 className={styles['small-card__title']}>{title}</h4>}
            {text && <p className={styles['small-card__text']}>{text}</p>}
        </div>
    );
}