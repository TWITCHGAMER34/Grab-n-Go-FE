/**
 * StaffDashboard
 *
 * Staff-facing dashboard that loads and displays all orders for personnel.
 * - Shows aggregate stats and filterable order lists.
 * - Supports locking orders (send to kitchen), adding comments, editing items,
 *   and updating order status with optimistic UI updates.
 * - Keeps transient UI state for modals, loading flags and per-order status updates.
 */
import {useMemo, useState, useEffect} from 'react';
import styles from './dashboard.module.scss';
import type {Order, OrderItem} from '../../../types/Order';
import {fetchAllOrders, addComment, lockOrder, updateStatus, updateOrder} from '../../../api/orders';
import {LogOut} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../../context/AuthContext.tsx';
import OrderCard from './components/OrderCard';
import EditOrderModal from './components/EditOrderModal';
import CommentModal from './components/CommentModal';
import Seo from '../../../components/Seo';

export default function StaffDashboard() {
    // Orders loaded from the API
    const [orders, setOrders] = useState<Order[]>([]);
    // Current filter for which orders are visible
    const [filter, setFilter] = useState<'all' | 'unhandled' | 'waiting' | 'processing' | 'done'>('all');
    // Global loading / error flags used while fetching or performing actions
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Logout UI state to prevent duplicate requests
    const [loggingOut, setLoggingOut] = useState(false);

    // Comment modal state: which order id is being commented and comment text
    const [commentingOrderId, setCommentingOrderId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [savingComment, setSavingComment] = useState(false);

    // Per-order status update loading map to disable individual controls while updating
    const [statusUpdating, setStatusUpdating] = useState<Record<string, boolean>>({});

    // Edit modal state: which order is being edited and a local draft of items
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const [editDraftItems, setEditDraftItems] = useState<OrderItem[] | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);

    const navigate = useNavigate();
    const {logout} = useAuth();

    // Fetch all orders from the API and store them in state.
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

    // Load orders on initial mount.
    useEffect(() => {
        loadOrders();
    }, []);

    // Map human/front-end status strings to the API status identifiers.
    function frontendToApiStatus(front: string): string {
        const s = (front || '').toLowerCase().trim();
        if (s === 'obehandlad') return 'pending';
        if (s === 'behandlas') return 'in_kitchen';
        if (s === 'redo') return 'ready';
        if (s === 'slutförd') return 'completed';
        return 'pending';
    }

    // Predicate to test if an order's status should be visible for the current filter.
    const statusMatchesFilter = (status: string, filterValue: typeof filter) => {
        if (filterValue === 'all') return true;
        if (filterValue === 'unhandled') return status === 'Obehandlad';
        if (filterValue === 'processing') return status === 'Behandlas' || status === 'in_kitchen' || status === 'In kitchen';
        if (filterValue === 'done') return status === 'Redo' || status === 'Slutförd' || status === 'completed' || status === 'ready';
        return false;
    };

    // Derived stats for the header (memoized for performance).
    const stats = useMemo(() => {
        const total = orders.length;
        const unhandled = orders.filter((o) => statusMatchesFilter(o.status, 'unhandled')).length;
        const processing = orders.filter((o) => statusMatchesFilter(o.status, 'processing')).length;
        const done = orders.filter((o) => statusMatchesFilter(o.status, 'done')).length;
        return {total, unhandled, processing, done};
    }, [orders]);

    // Orders to render according to the active filter
    const visible = orders.filter((o) => statusMatchesFilter(o.status, filter));

    // Log out handler with simple duplicate-prevention
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

    // Open comment modal and prefill with existing note when available
    const openComment = (order: Order) => {
        setCommentingOrderId(order?.id != null ? String(order.id) : null);
        setCommentText(order?.note ?? '');
    };

    // Close comment modal and reset related state
    const closeComment = () => {
        setCommentingOrderId(null);
        setCommentText('');
        setSavingComment(false);
    };

    // Persist comment to the server and refresh orders on success
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

    // Lock an order (send to kitchen). Confirm with the user first.
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

    // Update status for a specific order with optimistic UI update and rollback on failure
    const handleStatusSelect = async (orderId: string | number, newStatus: string) => {
        const id = String(orderId);
        const prevStatus = orders.find((o) => String(o.id) === id)?.status ?? '';
        if (prevStatus === newStatus) return;

        const apiStatus = frontendToApiStatus(newStatus);

        // Optimistically update UI
        setOrders((prev) => prev.map((o) => (String(o.id) === id ? {...o, status: newStatus} : o)));
        setStatusUpdating((s) => ({...s, [id]: true}));
        setError(null);

        try {
            await updateStatus(orderId, apiStatus);
        } catch (err: any) {
            // Rollback to previous status on error
            setOrders((prev) => prev.map((o) => (String(o.id) === id ? {...o, status: prevStatus} : o)));
            setError(err?.response?.data?.message ?? err?.message ?? 'Failed to update status');
        } finally {
            setStatusUpdating((s) => {
                const copy = {...s};
                delete copy[id];
                return copy;
            });
        }
    };

    // --- Edit helpers ---

    // Open edit modal and create a local copy of items for drafting changes
    const openEdit = (order: Order) => {
        const id = order?.id != null ? String(order.id) : null;
        setEditingOrderId(id);
        setEditDraftItems(Array.isArray(order?.items) ? order.items.map(it => ({...it})) : []);
    };

    // Close edit modal and reset draft state
    const closeEdit = () => {
        setEditingOrderId(null);
        setEditDraftItems(null);
        setSavingEdit(false);
    };

    // Update a single item in the local draft by index
    const updateDraftItem = (index: number, changes: Partial<OrderItem>) => {
        setEditDraftItems((prev) => {
            if (!prev) return prev;
            return prev.map((it, i) => (i === index ? {...it, ...changes} : it));
        });
    };

    // Persist draft edits to the server and refresh orders on success
    const saveEdit = async () => {
        if (!editingOrderId || !editDraftItems) return;
        setSavingEdit(true);
        setError(null);

        const itemsPayload = editDraftItems.map((it: any) => {
            const qty = Number(it.qty ?? 0);
            const notes = (it as any).notes;

            if (it.order_item_id) {
                if (qty <= 0) return {order_item_id: it.order_item_id, delete: true};
                const p: any = {order_item_id: it.order_item_id, quantity: qty};
                if (notes) p.notes = notes;
                return p;
            }

            const menuId = it.menu_item_id ?? it.id ?? undefined;
            if (menuId !== undefined) {
                if (qty <= 0) return {menu_item_id: menuId, delete: true};
                const p: any = {menu_item_id: menuId, quantity: qty};
                if (notes) p.notes = notes;
                return p;
            }

            if (qty <= 0) return {name: it.name, delete: true};
            const p: any = {name: it.name, quantity: qty};
            if (notes) p.notes = notes;
            return p;
        });

        try {
            await updateOrder(editingOrderId, {items: itemsPayload});
            await loadOrders();
            closeEdit();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Failed to update order');
            setSavingEdit(false);
        }
    };

    return (
        <>
            <Seo title="Staff Dashboard" description="Overview of orders" />
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
                        <button onClick={handleLogout} className={styles['staff-dashboard__logout']}>
                            <LogOut/> Logga ut
                        </button>
                    </div>
                </header>

                <section className={styles['staff-dashboard__stats']}>
                    <div className={styles['staff-dashboard__stat']}>
                        <div className={styles['staff-dashboard__stat-label']}>Totalt antal</div>
                        <div className={styles['staff-dashboard__stat-value']}>{stats.total}</div>
                    </div>

                    <div className={`${styles['staff-dashboard__stat']} ${styles['staff-dashboard__stat--yellow']}`}>
                        <div className={styles['staff-dashboard__stat-label']}>Obehandlade</div>
                        <div className={styles['staff-dashboard__stat-value']}>{stats.unhandled}</div>
                    </div>

                    <div className={`${styles['staff-dashboard__stat']} ${styles['staff-dashboard__stat--blue']}`}>
                        <div className={styles['staff-dashboard__stat-label']}>Behandlas</div>
                        <div className={styles['staff-dashboard__stat-value']}>{stats.processing}</div>
                    </div>

                    <div className={`${styles['staff-dashboard__stat']} ${styles['staff-dashboard__stat--green']}`}>
                        <div className={styles['staff-dashboard__stat-label']}>Redo/Slutförd</div>
                        <div className={styles['staff-dashboard__stat-value']}>{stats.done}</div>
                    </div>
                </section>

                <nav className={styles['staff-dashboard__filters']}>
                    <button
                        className={`${styles['staff-dashboard__filter-pill']} ${filter === 'all' ? styles['staff-dashboard__filter-pill--active'] : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Alla ({orders.length})
                    </button>
                    <button
                        className={`${styles['staff-dashboard__filter-pill']} ${filter === 'unhandled' ? styles['staff-dashboard__filter-pill--active'] : ''}`}
                        onClick={() => setFilter('unhandled')}
                    >
                        Obehandlade ({stats.unhandled})
                    </button>
                    <button
                        className={`${styles['staff-dashboard__filter-pill']} ${filter === 'processing' ? styles['staff-dashboard__filter-pill--active'] : ''}`}
                        onClick={() => setFilter('processing')}
                    >
                        Behandlas ({stats.processing})
                    </button>
                    <button
                        className={`${styles['staff-dashboard__filter-pill']} ${filter === 'done' ? styles['staff-dashboard__filter-pill--active'] : ''}`}
                        onClick={() => setFilter('done')}
                    >
                        Slutförd ({stats.done})
                    </button>
                </nav>

                <main className={styles['staff-dashboard__list']}>
                    {error && <div className={styles['staff-dashboard__error']}>Error: {error}</div>}

                    {loading && <div className={styles['staff-dashboard__loading']}>Laddar beställningar…</div>}

                    {!loading && visible.length === 0 && !error && (
                        <div className={styles['staff-dashboard__empty']}>
                            <p className={styles['staff-dashboard__empty-text']}>Inga beställningar</p>
                        </div>
                    )}

                    {!loading && visible.map((o) => (
                        <OrderCard
                            key={String(o.id)}
                            order={o}
                            loading={loading}
                            statusUpdating={statusUpdating}
                            onLock={handleLock}
                            onOpenComment={() => openComment(o)}
                            onOpenEdit={() => openEdit(o)}
                            onStatusSelect={handleStatusSelect}
                        />
                    ))}

                    {commentingOrderId && (
                        <CommentModal
                            orderId={commentingOrderId}
                            text={commentText}
                            onChangeText={setCommentText}
                            onClose={closeComment}
                            onSave={saveComment}
                            saving={savingComment}
                        />
                    )}

                    {editingOrderId !== null && editDraftItems && (
                        <EditOrderModal
                            orderId={editingOrderId}
                            items={editDraftItems}
                            onUpdateItem={updateDraftItem}
                            onClose={closeEdit}
                            onSave={saveEdit}
                            saving={savingEdit}
                            loading={loading}
                        />
                    )}
                </main>
            </div>
        </>
    );
}
