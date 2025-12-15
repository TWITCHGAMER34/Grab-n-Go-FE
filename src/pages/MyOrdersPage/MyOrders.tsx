// File: `src/pages/MyOrdersPage/MyOrders.tsx`
/**
 * MyOrders page
 *
 * - Loads the authenticated user's orders on mount.
 * - Provides search/filtering, in-place editing of order items, and order cancellation.
 * - Maintains transient edit drafts so UI edits do not immediately affect server state.
 * - Handles optimistic UI updates by refetching after successful mutations.
 */
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navbar/NavBar';
import Footer from '../../components/footer/Footer';
import './MyOrders.scss';
import OrderList from './OrderList';
import type { Order, OrderItem } from '../../types/Order';
import { fetchOrders, updateOrder, deleteOrder } from '../../api/orders';
import Seo from "../../components/Seo.tsx";

export default function MyOrders() {
    // Current authenticated user from context
    const { user } = useAuth();

    // Orders loaded from the API
    const [orders, setOrders] = useState<Order[]>([]);
    // Global loading flag used for API operations
    const [loading, setLoading] = useState(false);
    // Which order is currently being edited (id) or null
    const [editingId, setEditingId] = useState<number | string | null>(null);
    // Local draft copies of order items keyed by order id (string)
    const [editDrafts, setEditDrafts] = useState<Record<string, OrderItem[]>>({});
    // Top-level error message shown to the user
    const [error, setError] = useState<string | null>(null);

    // Search input for filtering orders
    const [search, setSearch] = useState('');

    // Load orders for the current user on mount or when `user` changes.
    useEffect(() => {
        async function load() {
            setError(null);
            setLoading(true);
            try {
                // If not authenticated, clear orders and skip fetch
                if (!user || !user.id) {
                    setOrders([]);
                    return;
                }
                const data = await fetchOrders(Number(user.id));
                setOrders(data || []);
            } catch (err: any) {
                setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user]);

    // Begin editing an order: set editing id and create a deep copy of items as a draft
    const startEdit = (order: Order) => {
        setEditingId(order.id);
        setEditDrafts((s) => ({ ...s, [String(order.id)]: order.items.map(i => ({ ...i })) }));
    };

    // Cancel editing: remove draft and clear editing id
    const cancelEdit = (id: number | string) => {
        setEditingId(null);
        setEditDrafts((s) => {
            const copy = { ...s };
            delete copy[String(id)];
            return copy;
        });
    };

    // Update a specific item within an order draft by index
    const updateItemDraft = (orderId: number | string, itemIndex: number, changes: Partial<OrderItem>) => {
        setEditDrafts((s) => {
            const key = String(orderId);
            const items = (s[key] || []).map((it, idx) => idx === itemIndex ? { ...it, ...changes } : it);
            return { ...s, [key]: items };
        });
    };

    // Submit edited order items to the server.
    // Transforms draft items into the API payload shape, marking deletes as needed.
    const submitEdit = async (orderId: number | string) => {
        if (!user || !user.id) {
            setError('Not authorized');
            return;
        }
        const draft = editDrafts[String(orderId)] || [];

        // Map each draft item into the server-expected update payload.
        const itemsPayload = draft.map((it: any) => {
            const qty = Number(it.qty ?? 0);

            // Existing order item (server-managed id)
            if (it.order_item_id) {
                if (qty <= 0) {
                    return { order_item_id: it.order_item_id, delete: true };
                }
                const p: any = { order_item_id: it.order_item_id, quantity: qty };
                if (it.notes) p.notes = it.notes;
                return p;
            }

            // New or menu-referenced item
            const menuId = it.menu_item_id ?? it.id ?? undefined;
            if (menuId !== undefined) {
                if (qty <= 0) {
                    return { menu_item_id: menuId, delete: true };
                }
                const p: any = { menu_item_id: menuId, quantity: qty };
                if (it.notes) p.notes = it.notes;
                return p;
            }

            // Free-text item (no menu id)
            if (qty <= 0) {
                return { name: it.name, delete: true };
            }
            const p: any = { name: it.name, quantity: qty };
            if (it.notes) p.notes = it.notes;
            return p;
        });

        try {
            setLoading(true);
            const payload = { user_id: Number(user.id), items: itemsPayload };
            console.log('Submitting order update payload:', payload);
            // Send update and then refresh the order list to reflect server state
            await updateOrder(orderId, payload);
            const refreshed = await fetchOrders(Number(user.id));
            setOrders(refreshed || []);
            cancelEdit(orderId);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Failed to update order');
        } finally {
            setLoading(false);
        }
    };

    // Cancel (delete) an order after user confirmation.
    const cancelOrder = async (orderId: number | string) => {
        if (!user || !user.id) {
            setError('Not authorized');
            return;
        }
        if (!confirm('Är du säker på att du vill avbryta beställningen?')) return;
        try {
            setLoading(true);
            await deleteOrder(orderId, Number(user.id));
            // Remove cancelled order from local state
            setOrders((prev) => prev.filter(o => String(o.id) !== String(orderId)));
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Failed to cancel order');
        } finally {
            setLoading(false);
        }
    };

    // Normalization helpers for searching (diacritics-insensitive, numeric-only)
    const removeDiacritics = (v: string) =>
        v.normalize?.('NFD').replace(/[\u0300-\u036f]/g, '') ?? v;
    const norm = (v?: string) => (v ? removeDiacritics(v).toLowerCase().trim() : '');
    const digits = (v?: string) => (v ? String(v).replace(/\D/g, '') : '');

    // Filter orders by search query (matches id, customer name, or phone digits)
    const filteredOrders = useMemo(() => {
        const q = search.trim();
        if (!q) return orders;
        const qNorm = norm(q);
        const qDigits = digits(q);

        return orders.filter((o) => {
            // match id (string)
            if (String(o.id).toLowerCase().includes(q.toLowerCase())) return true;

            // match customer name (diacritics insensitive)
            if (o.customer && norm(o.customer).includes(qNorm)) return true;

            // match phone number by digits only
            const phoneDigits = digits(o.phone);
            if (qDigits && phoneDigits.includes(qDigits)) return true;

            return false;
        });
    }, [orders, search]);

    return (
        <>
            <Seo title="My orders" description="See your orders" />
            <Navbar />
            <main className="my-orders-page">
                <div className="container">
                    <h1 className="page-title">Mina Beställningar</h1>

                    <div className="search-row">
                        {/* Search input for filtering the order list */}
                        <input
                            placeholder="Sök efter Order-Id, namn eller telefon"
                            className="search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Global loading / error indicators */}
                    {loading && <div className="muted">Loading…</div>}
                    {error && <div className="error">{error}</div>}

                    {/* OrderList receives all handlers and current state slices */}
                    <OrderList
                        orders={filteredOrders}
                        loading={loading}
                        editingId={editingId}
                        editDrafts={editDrafts}
                        startEdit={startEdit}
                        cancelEdit={cancelEdit}
                        updateItemDraft={updateItemDraft}
                        submitEdit={submitEdit}
                        cancelOrder={cancelOrder}
                    />
                </div>
            </main>
            <Footer />
        </>
    );
}
