// File: `src/pages/MyOrdersPage/MyOrders.tsx`
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navbar/NavBar';
import Footer from '../../components/footer/Footer';
import './MyOrders.scss';
import OrderList from './OrderList';
import type { Order, OrderItem } from '../../types/Order';
import { fetchOrders, updateOrder, deleteOrder } from '../../api/orders';

export default function MyOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [editDrafts, setEditDrafts] = useState<Record<string, OrderItem[]>>({});
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            setError(null);
            setLoading(true);
            try {
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

    const startEdit = (order: Order) => {
        setEditingId(order.id);
        setEditDrafts((s) => ({ ...s, [String(order.id)]: order.items.map(i => ({ ...i })) }));
    };

    const cancelEdit = (id: number | string) => {
        setEditingId(null);
        setEditDrafts((s) => {
            const copy = { ...s };
            delete copy[String(id)];
            return copy;
        });
    };

    const updateItemDraft = (orderId: number | string, itemIndex: number, changes: Partial<OrderItem>) => {
        setEditDrafts((s) => {
            const key = String(orderId);
            const items = (s[key] || []).map((it, idx) => idx === itemIndex ? { ...it, ...changes } : it);
            return { ...s, [key]: items };
        });
    };

    const submitEdit = async (orderId: number | string) => {
        if (!user || !user.id) {
            setError('Not authorized');
            return;
        }
        const draft = editDrafts[String(orderId)] || [];

        const itemsPayload = draft.map((it: any) => {
            const qty = Number(it.qty ?? 0);

            if (it.order_item_id) {
                if (qty <= 0) {
                    return { order_item_id: it.order_item_id, delete: true };
                }
                const p: any = { order_item_id: it.order_item_id, quantity: qty };
                if (it.notes) p.notes = it.notes;
                return p;
            }

            const menuId = it.menu_item_id ?? it.id ?? undefined;
            if (menuId !== undefined) {
                if (qty <= 0) {
                    return { menu_item_id: menuId, delete: true };
                }
                const p: any = { menu_item_id: menuId, quantity: qty };
                if (it.notes) p.notes = it.notes;
                return p;
            }

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

    const cancelOrder = async (orderId: number | string) => {
        if (!user || !user.id) {
            setError('Not authorized');
            return;
        }
        if (!confirm('Är du säker på att du vill avbryta beställningen?')) return;
        try {
            setLoading(true);
            await deleteOrder(orderId, Number(user.id));
            setOrders((prev) => prev.filter(o => String(o.id) !== String(orderId)));
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Failed to cancel order');
        } finally {
            setLoading(false);
        }
    };

    // normalization helpers
    const removeDiacritics = (v: string) =>
        v.normalize?.('NFD').replace(/[\u0300-\u036f]/g, '') ?? v;
    const norm = (v?: string) => (v ? removeDiacritics(v).toLowerCase().trim() : '');
    const digits = (v?: string) => (v ? String(v).replace(/\D/g, '') : '');

    const filteredOrders = useMemo(() => {
        const q = search.trim();
        if (!q) return orders;
        const qNorm = norm(q);
        const qDigits = digits(q);

        return orders.filter((o) => {
            // match id
            if (String(o.id).toLowerCase().includes(q.toLowerCase())) return true;

            // match customer name (diacritics insensitive)
            if (o.customer && norm(o.customer).includes(qNorm)) return true;

            // match phone number by digits
            const phoneDigits = digits(o.phone);
            if (qDigits && phoneDigits.includes(qDigits)) return true;

            return false;
        });
    }, [orders, search]);

    return (
        <>
            <Navbar />
            <main className="my-orders-page">
                <div className="container">
                    <h1 className="page-title">Mina Beställningar</h1>

                    <div className="search-row">
                        <input
                            placeholder="Sök efter Order-Id, namn eller telefon"
                            className="search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {loading && <div className="muted">Loading…</div>}
                    {error && <div className="error">{error}</div>}

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
