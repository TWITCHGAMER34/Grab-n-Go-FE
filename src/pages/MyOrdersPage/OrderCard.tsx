// File: `src/pages/MyOrdersPage/OrderCard.tsx`
import type { Order, OrderItem } from '../../types/Order';

type Props = {
    order: Order;
    isEditing: boolean;
    draftItems: OrderItem[];
    loading: boolean;
    startEdit: (o: Order) => void;
    cancelEdit: (id: number | string) => void;
    updateItemDraft: (orderId: number | string, itemIndex: number, changes: Partial<OrderItem>) => void;
    submitEdit: (orderId: number | string) => Promise<void>;
    cancelOrder: (orderId: number | string) => Promise<void>;
};

const normalize = (v?: string) =>
    (v || '')
        .normalize?.('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim() ?? (v || '').toLowerCase();

function getStatusStyle(status?: string): React.CSSProperties {
    const s = normalize(status);
    const base: React.CSSProperties = {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: '0.85em',
        fontWeight: 600,
    };

    if (s.includes('behandl') || s.includes('tillag') || s.includes('kitchen') || s.includes('in_kitchen')) {
        return { ...base, backgroundColor: '#fff3cd', color: '#856404' }; // yellow-ish
    }

    if (s.includes('obehandl') || s === 'pending' || s.includes('unhandled')) {
        return { ...base, backgroundColor: '#e2e3e5', color: '#383d41' }; // gray
    }

    if (s.includes('redo') || s.includes('slutf') || s.includes('completed') || s.includes('klar')) {
        return { ...base, backgroundColor: '#d4edda', color: '#155724' }; // green
    }

    if (s.includes('vantar') || s.includes('waiting')) {
        return { ...base, backgroundColor: '#cce5ff', color: '#004085' }; // blue
    }

    return { ...base, backgroundColor: '#f1f1f1', color: '#333' }; // neutral
}

export default function OrderCard({
                                      order,
                                      isEditing,
                                      draftItems,
                                      loading,
                                      startEdit,
                                      cancelEdit,
                                      updateItemDraft,
                                      submitEdit,
                                      cancelOrder,
                                  }: Props) {
    const orderTotal = (order.items || []).reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);

    // order.locked is a boolean (normalized in api mapper)
    const isLocked = Boolean(order.locked);

    // only allow edits/cancel when status is exactly "Obehandlad" (after normalization) and not locked
    const isPending = normalize(order.status) === 'obehandlad';
    const showActions = !isLocked && isPending && !isEditing;

    return (
        <div className="my-orders-page__order-card" key={order.id}>
            <div className="my-orders-page__order-head">
                <div>
                    <div className="my-orders-page__order-title">
                        Order #{order.id}{' '}
                        {order.status && (
                            <span
                                className="my-orders-page__status"
                                style={getStatusStyle(order.status)}
                            >
                                {order.status}
                            </span>
                        )}
                    </div>

                    <div className="my-orders-page__meta">
                        {order.customer && <div>Kund: {order.customer}</div>}
                        {order.phone && <div>Telefon: {order.phone}</div>}
                        {order.createdAt && <div>Beställd: {order.createdAt}</div>}
                        {order.pickupAt && <div>Önskad upphämtning: {order.pickupAt}</div>}
                    </div>
                </div>

                <div className="my-orders-page__order-actions">
                    {!isEditing && showActions && (
                        <button
                            className="my-orders-page__btn my-orders-page__btn--edit"
                            onClick={() => startEdit(order)}
                        >
                            Redigera
                        </button>
                    )}
                    {!isEditing && showActions && (
                        <button
                            className="my-orders-page__btn my-orders-page__btn--cancel"
                            onClick={() => cancelOrder(order.id)}
                        >
                            Avbryt beställning
                        </button>
                    )}
                </div>
            </div>

            <div className="my-orders-page__order-body">
                {!isEditing && (
                    <div className="my-orders-page__items-list">
                        {order.items.map((it, idx) => (
                            <div className="my-orders-page__item-row" key={idx}>
                                <div className="my-orders-page__item-left">{it.qty}x {it.name ?? `#${idx}`}</div>
                                <div className="my-orders-page__item-right">{(it.price || 0) * (it.qty || 0)} kr</div>
                            </div>
                        ))}
                        <div className="my-orders-page__order-total">Totalt <strong className="my-orders-page__order-total--color">{orderTotal} kr</strong></div>
                    </div>
                )}

                {isEditing && (
                    <div className="my-orders-page__edit-form">
                        {draftItems.map((it, idx) => (
                            <div className="my-orders-page__edit-row" key={idx}>
                                <div className="my-orders-page__edit-name">{it.name ?? `#${idx}`}</div>
                                <div className="my-orders-page__edit-controls">
                                    <input
                                        type="number"
                                        min={0}
                                        value={it.qty}
                                        className="my-orders-page__edit-input"
                                        onChange={(e) => updateItemDraft(order.id, idx, { qty: Math.max(0, Number(e.target.value || 0)) })}
                                    />
                                    <label className="my-orders-page__mark-delete">
                                        <input
                                            type="checkbox"
                                            className="my-orders-page__Mark-delete-input"
                                            checked={(it.qty || 0) <= 0}
                                            onChange={(e) => updateItemDraft(order.id, idx, { qty: e.target.checked ? 0 : Math.max(1, it.qty || 1) })}
                                        /> Ta bort
                                    </label>
                                </div>
                            </div>
                        ))}

                        <div className="my-orders-page__edit-actions">
                            <button className="my-orders-page__btn my-orders-page__btn--save" onClick={() => submitEdit(order.id)} disabled={loading}>Spara ändringar</button>
                            <button className="my-orders-page__btn my-orders-page__btn--ghost" onClick={() => cancelEdit(order.id)}>Avbryt</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
