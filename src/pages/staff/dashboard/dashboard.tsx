// typescript
import {useMemo, useState, useEffect} from 'react';
import styles from './dashboard.module.scss';
import type {Order} from '../../../types/Order';
import {fetchAllOrders, addComment, lockOrder, updateStatus} from '../../../api/orders';
import {Lock, LogOut} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from "../../../context/AuthContext.tsx";

export default function StaffDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<'all' | 'unhandled' | 'waiting' | 'processing' | 'done'>('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const [commentingOrderId, setCommentingOrderId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [savingComment, setSavingComment] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState<Record<string, boolean>>({});

    const navigate = useNavigate();
    const {logout} = useAuth();

    const loadOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    // Reverse mapping: frontend (Swedish) -> backend status keys
    function frontendToApiStatus(front: string): string {
        const s = (front || '').toLowerCase().trim();
        if (s === 'obehandlad' || s === 'obehandlade') return 'pending';
        if (s === 'behandlas') return 'in_kitchen';
        if (s === 'redo') return 'ready';
        if (s === 'slutförd' || s === 'slutförd' || s === 'slutförd') return 'completed';
        if (s === 'avbruten') return 'cancelled';
        // fallback: try some english variants
        if (s.includes('processing') || s.includes('kitchen')) return 'in_kitchen';
        if (s.includes('done') || s.includes('completed') || s.includes('ready')) return 'completed';
        return 'pending';
    }

    // Helper to match the frontend filter to the localized status strings returned by the API
    const statusMatchesFilter = (status: string, filterValue: typeof filter) => {
        if (filterValue === 'all') return true;
        if (filterValue === 'unhandled') return status === 'Obehandlad';
        if (filterValue === 'processing') return status === 'Behandlas' || status === 'in_kitchen' || status === 'In kitchen';
        if (filterValue === 'waiting') return status === 'Väntar' || status === 'waiting';
        if (filterValue === 'done') return status === 'Redo' || status === 'Slutförd' || status === 'completed' || status === 'ready';
        return false;
    };

    const stats = useMemo(() => {
        const total = orders.length;
        const unhandled = orders.filter((o) => statusMatchesFilter(o.status, 'unhandled')).length;
        const processing = orders.filter((o) => statusMatchesFilter(o.status, 'processing')).length;
        const done = orders.filter((o) => statusMatchesFilter(o.status, 'done')).length;
        return {total, unhandled, processing, done};
    }, [orders]);

    const visible = orders.filter((o) => statusMatchesFilter(o.status, filter));

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await logout();
            navigate('/', {replace: true});
        } finally {
            setLoggingOut(false);
        }
    };

    const openComment = (order: Order) => {
        setCommentingOrderId(order.id);
        setCommentText(order.note ?? '');
    };

    const closeComment = () => {
        setCommentingOrderId(null);
        setCommentText('');
        setSavingComment(false);
    };

    const saveComment = async () => {
        if (!commentingOrderId) return;
        setSavingComment(true);

        try {
            await addComment(commentingOrderId, commentText.trim());
            await loadOrders();
            closeComment();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Failed to save comment');
            setSavingComment(false);
        }
    };

    const handleLock = async (orderId: string | number) => {
        if (!confirm('Skicka till köket och lås beställningen?')) return;
        setLoading(true);
        setError(null);
        try {
            await lockOrder(orderId);
            await loadOrders();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Failed to lock order');
        } finally {
            setLoading(false);
        }
    };

    // Send status update to backend immediately when a select changes (optimistic UI)
    const handleStatusSelect = async (orderId: string | number, newStatus: string) => {
        const id = String(orderId);
        const prevStatus = orders.find((o) => o.id === id)?.status ?? '';
        if (prevStatus === newStatus) return;

        const apiStatus = frontendToApiStatus(newStatus);

        // optimistic update
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
        setStatusUpdating((s) => ({ ...s, [id]: true }));
        setError(null);

        try {
            await updateStatus(orderId, apiStatus);
            // optionally: refresh single order or list — here we keep optimistic change
        } catch (err: any) {
            // revert on error
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: prevStatus } : o)));
            setError(err?.response?.data?.message ?? err?.message ?? 'Failed to update status');
        } finally {
            setStatusUpdating((s) => {
                const copy = { ...s };
                delete copy[id];
                return copy;
            });
        }
    };

    return (
        <div className={styles['staff-dashboard']}>
            <header className={styles['staff-dashboard__header']}>
                <div>
                    <h1 className={styles['staff-dashboard__title']}>Personalportalen</h1>
                    <div className={styles['staff-dashboard__subtitle']}>Hantera inkommande beställningar</div>
                </div>
                <div className={styles['staff-dashboard__actions']}>
                    <button
                        className={styles['staff-dashboard__refresh']}
                        title="Refresh"
                        onClick={loadOrders}
                        disabled={loading}
                    >
                        {loading ? 'Loading…' : '⟳'}
                    </button>
                    <button onClick={handleLogout} className={styles['staff-dashboard__logout']}><LogOut/> Logga ut
                    </button>
                </div>
            </header>

            <section className={styles['staff-dashboard__stats']}>
                <div className={styles['stat-card']}>
                    <div className={styles['stat-card__label']}>Totalt antal</div>
                    <div className={styles['stat-card__value']}>{stats.total}</div>
                </div>

                <div className={`${styles['stat-card']} ${styles['stat-card--yellow']}`}>
                    <div className={styles['stat-card__label']}>Obehandlade</div>
                    <div className={styles['stat-card__value']}>{stats.unhandled}</div>
                </div>

                <div className={`${styles['stat-card']} ${styles['stat-card--blue']}`}>
                    <div className={styles['stat-card__label']}>Behandlas</div>
                    <div className={styles['stat-card__value']}>{stats.processing}</div>
                </div>

                <div className={`${styles['stat-card']} ${styles['stat-card--green']}`}>
                    <div className={styles['stat-card__label']}>Redo/Slutförd</div>
                    <div className={styles['stat-card__value']}>{stats.done}</div>
                </div>
            </section>

            <nav className={styles['staff-dashboard__filters']}>
                <button className={`${styles['filter-pill']} ${filter === 'all' ? styles['filter-pill--active'] : ''}`}
                        onClick={() => setFilter('all')}>
                    Alla ({orders.length})
                </button>
                <button
                    className={`${styles['filter-pill']} ${filter === 'unhandled' ? styles['filter-pill--active'] : ''}`}
                    onClick={() => setFilter('unhandled')}>
                    Obehandlade ({stats.unhandled})
                </button>
                <button
                    className={`${styles['filter-pill']} ${filter === 'processing' ? styles['filter-pill--active'] : ''}`}
                    onClick={() => setFilter('processing')}>
                    Behandlas ({stats.processing})
                </button>
                <button className={`${styles['filter-pill']} ${filter === 'done' ? styles['filter-pill--active'] : ''}`}
                        onClick={() => setFilter('done')}>
                    Slutförd ({stats.done})
                </button>
            </nav>

            <main className={styles['staff-dashboard__list']}>
                {error && <div className={styles['staff-dashboard__error']}>Error: {error}</div>}
                {!loading && visible.length === 0 && !error && <div className={styles['staff-dashboard__empty']}><p
                    className={styles['staff-dashboard__empty__text']}>Inga beställningar</p></div>}
                {loading && <div className={styles['staff-dashboard__loading']}>Laddar beställningar…</div>}

                {!loading && visible.map((o) => {
                    const isLocked = Boolean((o as any).locked);
                    return (
                        <article key={o.id} className={styles['order-card']}>
                        <div className={styles['order-card__body']}>
                            <div className={styles['order-card__meta']}>
                                <h3 className={styles['order-card__title']}>Order #{o.id} - {o.status}</h3>
                                <div className={styles['order-card__info']}>
                                    <div><strong>Kund:</strong> {o.customer}</div>
                                    <div><strong>Telefon:</strong> {o.phone}</div>
                                    <div><strong>E-post:</strong> {o.email}</div>
                                    <div><strong>Beställd:</strong> {o.createdAt}</div>
                                    <div><strong>Önskad upphämtning:</strong> {o.pickupAt}</div>
                                </div>
                            </div>

                            <div className={styles['order-card__items']}>
                                <div className={styles['order-card__section-title']}>Beställda varor</div>
                                <ul className={styles['order-card__items-list']}>
                                    {o.items.map((it, i) => (
                                        <li key={i} className={styles['order-card__item']}>
                                            <span className={styles['order-card__item-name']}>{it.qty}x {it.name}</span>
                                            <span className={styles['order-card__item-price']}>{it.price} kr</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className={styles['order-card__section-title']}>Kommentar till köket</div>
                                <div className={styles['order-card__note']}>{o.note ?? 'Ingen kommentar tillagd'}</div>
                            </div>
                        </div>

                            <div className={styles['order-card__footer']}>
                                <div className={styles['order-card__total']}>
                                    <div className={styles['order-card__total-label']}>Totalt</div>
                                    <div className={styles['order-card__total-value']}>{o.total} kr</div>
                                </div>

                                <div className={styles['order-card__controls']}>
                                    <button
                                        className={styles['btn--primary']}
                                        onClick={() => handleLock(o.id)}
                                        disabled={loading || isLocked}
                                    >
                                        <Lock size={20}/> {isLocked ? 'Låst (Tillagas)' : 'Lås (Skicka till kök)'}
                                    </button>

                                    <select
                                        className={styles['select-status']}
                                        value={o.status}
                                        onChange={(e) => handleStatusSelect(o.id, e.target.value)}
                                        disabled={loading || Boolean(statusUpdating[o.id])}
                                    >
                                        <option value="Obehandlad">Obehandlad</option>
                                        <option value="Behandlas">Behandlas</option>
                                        <option value="Redo">Redo</option>
                                        <option value="Slutförd">Slutförd</option>
                                    </select>

                                    <button
                                        className={styles['btn--secondary']}
                                        onClick={() => openComment(o)}
                                    >
                                        Kommentera köket
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}

                {commentingOrderId && (
                    <div className={styles['modal-overlay'] ?? ''} style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}>
                        <div style={{background: '#fff', padding: 20, borderRadius: 6, width: '90%', maxWidth: 600}}>
                            <h3>Kommentar till köket</h3>
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={6}
                                style={{width: '100%', marginTop: 8}}
                            />
                            <div style={{display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end'}}>
                                <button onClick={closeComment} className={styles['btn--ghost']}>Avbryt</button>
                                <button onClick={saveComment} className={styles['btn--primary']}
                                        disabled={savingComment}>
                                    {savingComment ? 'Sparar…' : 'Spara kommentar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
