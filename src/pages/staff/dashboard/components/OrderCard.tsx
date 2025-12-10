// File: src/pages/staff/dashboard/components/OrderCard.tsx
import styles from '../dashboard.module.scss';
import type { Order } from '../../../../types/Order';
import { Lock } from 'lucide-react';

type Props = {
    order: Order;
    loading: boolean;
    statusUpdating: Record<string, boolean>;
    onLock: (id: string | number) => void;
    onOpenComment: () => void;
    onOpenEdit: () => void;
    onStatusSelect: (id: string | number, newStatus: string) => void;
};

export default function OrderCard({ order, loading, statusUpdating, onLock, onOpenComment, onOpenEdit, onStatusSelect }: Props) {
    const id = order?.id != null ? String(order.id) : '';
    const isLocked = Boolean((order as any).locked);

    return (
        <article className={styles['staff-dashboard__order-card']}>
            <div className={styles['staff-dashboard__order-body']}>
                <div className={styles['staff-dashboard__order-meta']}>
                    <h3 className={styles['staff-dashboard__order-title']}>Order #{id} - {order.status}</h3>
                    <div className={styles['staff-dashboard__order-info']}>
                        <div><strong>Kund:</strong> {order.customer}</div>
                        <div><strong>Telefon:</strong> {order.phone}</div>
                        <div><strong>E-post:</strong> {order.email}</div>
                        <div><strong>Beställd:</strong> {order.createdAt}</div>
                        <div><strong>Önskad upphämtning:</strong> {order.pickupAt}</div>
                    </div>
                </div>

                <div className={styles['staff-dashboard__order-items']}>
                    <div className={styles['staff-dashboard__order-section-title']}>Beställda varor</div>
                    <ul className={styles['staff-dashboard__order-items-list']}>
                        {(Array.isArray(order.items) ? order.items : []).map((it, i) => (
                            <li key={i} className={styles['staff-dashboard__order-item']}>
                                <span className={styles['staff-dashboard__order-item-name']}>{it.qty}x {it.name}</span>
                                <span className={styles['staff-dashboard__order-item-price']}>{it.price} kr</span>
                            </li>
                        ))}
                    </ul>

                    <div className={styles['staff-dashboard__order-section-title']}>Kommentar till köket</div>
                    <div className={styles['staff-dashboard__order-note']}>{order.note ?? 'Ingen kommentar tillagd'}</div>
                </div>
            </div>

            <div className={styles['staff-dashboard__order-footer']}>
                <div className={styles['staff-dashboard__order-total']}>
                    <div className={styles['staff-dashboard__order-total-label']}>Totalt</div>
                    <div className={styles['staff-dashboard__order-total-value']}>{order.total} kr</div>
                </div>

                <div className={styles['staff-dashboard__order-controls']}>
                    <button
                        className={styles['staff-dashboard__btn-primary']}
                        onClick={() => onLock(order.id)}
                        disabled={loading || isLocked}
                    >
                        <Lock size={18} /> {isLocked ? 'Låst (Tillagas)' : 'Lås (Skicka till kök)'}
                    </button>

                    <select
                        className={styles['staff-dashboard__select-status']}
                        value={order.status}
                        onChange={(e) => onStatusSelect(order.id, e.target.value)}
                        disabled={loading || Boolean(statusUpdating[String(order.id)])}
                    >
                        <option value="Obehandlad">Obehandlad</option>
                        <option value="Behandlas">Behandlas</option>
                        <option value="Redo">Redo</option>
                        <option value="Slutförd">Slutförd</option>
                    </select>

                    <button className={styles['staff-dashboard__btn-secondary']} onClick={onOpenComment}>
                        Kommentera köket
                    </button>

                    <button className={styles['staff-dashboard__btn-secondary']} onClick={onOpenEdit} disabled={loading || isLocked}>
                        Ändra beställning
                    </button>
                </div>
            </div>
        </article>
    );
}
