// File: src/pages/staff/dashboard/components/EditOrderModal.tsx
import styles from '../dashboard.module.scss';
import type { OrderItem } from '../../../../types/Order';

type Props = {
    orderId: string;
    items: OrderItem[];
    onUpdateItem: (index: number, changes: Partial<OrderItem>) => void;
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
    loading: boolean;
};

export default function EditOrderModal({ orderId, items, onUpdateItem, onClose, onSave, saving, loading }: Props) {
    return (
        <div className={styles['staff-dashboard__modal-overlay']} style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <div className={styles['staff-dashboard__modal']} role="dialog" aria-modal="true" style={{ maxHeight: '90%', overflowY: 'auto' }}>
                <h3 className={styles['staff-dashboard__modal-title']}>Ändra beställning #{orderId}</h3>

                <div className={styles['staff-dashboard__modal-body']}>
                    {items.map((it, idx) => (
                        <div key={idx} className={styles['staff-dashboard__modal-item']}>
                            <div className={styles['staff-dashboard__modal-item-main']}>
                                <div className={styles['staff-dashboard__modal-item-name']}>{it.name}</div>
                                {(it as any).notes && <div className={styles['staff-dashboard__modal-item-notes']}>{(it as any).notes}</div>}
                            </div>

                            <div className={styles['staff-dashboard__modal-item-controls']}>
                                <input
                                    type="number"
                                    min={0}
                                    value={it.qty ?? 0}
                                    onChange={(e) => onUpdateItem(idx, { qty: Math.max(0, Number(e.target.value || 0)) })}
                                    className={styles['staff-dashboard__modal-item-qty']}
                                />
                                <label className={styles['staff-dashboard__modal-item-remove']}>
                                    <input
                                        type="checkbox"
                                        checked={(it.qty ?? 0) <= 0}
                                        onChange={(e) => onUpdateItem(idx, { qty: e.target.checked ? 0 : Math.max(1, it.qty ?? 1) })}
                                    />
                                    Ta bort
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles['staff-dashboard__modal-actions']}>
                    <button className={styles['staff-dashboard__btn-ghost']} onClick={onClose} disabled={saving}>Avbryt</button>
                    <button className={styles['staff-dashboard__btn-primary']} onClick={onSave} disabled={saving || loading}>
                        {saving ? 'Sparar…' : 'Spara ändringar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
