// File: src/pages/staff/dashboard/components/CommentModal.tsx
import styles from '../dashboard.module.scss';

type Props = {
    orderId: string;
    text: string;
    onChangeText: (v: string) => void;
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
};

export default function CommentModal({ orderId, text, onChangeText, onClose, onSave, saving }: Props) {
    return (
        <div className={styles['staff-dashboard__modal-overlay']} style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <div className={styles['staff-dashboard__modal']} role="dialog" aria-modal="true" style={{ maxWidth: 600 }}>
                <h3 className={styles['staff-dashboard__modal-title']}>Kommentar till köket</h3>
                <textarea
                    className={styles['staff-dashboard__modal-textarea']}
                    value={text}
                    onChange={(e) => onChangeText(e.target.value)}
                    rows={6}
                />
                <div className={styles['staff-dashboard__modal-actions']}>
                    <button className={styles['staff-dashboard__btn-ghost']} onClick={onClose} disabled={saving}>Avbryt</button>
                    <button className={styles['staff-dashboard__btn-primary']} onClick={onSave} disabled={saving}>
                        {saving ? 'Sparar…' : 'Spara kommentar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
