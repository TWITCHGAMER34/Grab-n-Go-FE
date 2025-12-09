// File: `src/pages/staff/dashboard/dashboard.tsx`
import { useMemo, useState, useEffect } from 'react';
import styles from './dashboard.module.scss';
import type { Order } from '../../../types/Order';
import { fetchAllOrders } from '../../../api/orders';
import { Lock, LogOut} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext.tsx";

export default function StaffDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<'all' | 'unhandled' | 'waiting' | 'processing' | 'done'>('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

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

    const stats = useMemo(() => {
        const total = orders.length;
        const unhandled = orders.filter((o) => o.status === 'unhandled').length;
        const processing = orders.filter((o) => o.status === 'processing').length;
        const done = orders.filter((o) => o.status === 'done').length;
        return { total, unhandled, processing, done };
    }, [orders]);

    const visible = orders.filter((o) => (filter === 'all' ? true : o.status === filter));

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await logout();
            navigate('/', { replace: true });
        } finally {
            setLoggingOut(false);
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
                    <button onClick={handleLogout} className={styles['staff-dashboard__logout']}><LogOut /> Logga ut</button>
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
                <button className={`${styles['filter-pill']} ${filter === 'all' ? styles['filter-pill--active'] : ''}`} onClick={() => setFilter('all')}>
                    Alla ({orders.length})
                </button>
                <button className={`${styles['filter-pill']} ${filter === 'unhandled' ? styles['filter-pill--active'] : ''}`} onClick={() => setFilter('unhandled')}>
                    Obehandlade ({stats.unhandled})
                </button>
                <button className={`${styles['filter-pill']} ${filter === 'waiting' ? styles['filter-pill--active'] : ''}`} onClick={() => setFilter('waiting')}>
                    Väntar (0)
                </button>
                <button className={`${styles['filter-pill']} ${filter === 'processing' ? styles['filter-pill--active'] : ''}`} onClick={() => setFilter('processing')}>
                    Behandlas ({stats.processing})
                </button>
                <button className={`${styles['filter-pill']} ${filter === 'done' ? styles['filter-pill--active'] : ''}`} onClick={() => setFilter('done')}>
                    Slutförd ({stats.done})
                </button>
            </nav>

            <main className={styles['staff-dashboard__list']}>
                {error && <div className={styles['staff-dashboard__error']}>Error: {error}</div>}
                {!loading && visible.length === 0 && !error && <div className={styles['staff-dashboard__empty']}>Inga beställningar</div>}
                {loading && <div className={styles['staff-dashboard__loading']}>Laddar beställningar…</div>}

                {!loading && visible.map((o) => (
                    <article key={o.id} className={styles['order-card']}>
                        <div className={styles['order-card__body']}>
                            <div className={styles['order-card__meta']}>
                                <h3 className={styles['order-card__title']}>Order  #{o.id}</h3>
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
                                <button className={styles['btn--primary']}><Lock size={20}/> Lås (Skicka till kök)</button>
                                <select className={styles['select-status']} defaultValue={o.status}>
                                    <option value="unhandled">Väntar</option>
                                    <option value="processing">Behandlas</option>
                                    <option value="done">Slutförd</option>
                                </select>
                            </div>
                        </div>
                    </article>
                ))}
            </main>
        </div>
    );
}
