// File: `src/pages/MyOrdersPage/MyOrders.tsx`
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navbar/NavBar';
import Footer from '../../components/footer/Footer';
import './MyOrders.scss';
import { useNavigate } from 'react-router-dom';

type OrderItem = {
  menu_item_id: number;
  name?: string;
  quantity: number;
  unit_price?: number;
};

type Order = {
  id: number | string;
  user_id?: number;
  guest_name?: string;
  guest_phone?: string;
  status?: string;
  created_at?: string;
  pickup_time?: string | null;
  items: OrderItem[];
  total?: number;
};

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editDrafts, setEditDrafts] = useState<Record<string, OrderItem[]>>({});
  const [error, setError] = useState<string | null>(null);
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchOrders() {
      setError(null);
      setLoading(true);
      try {
        if (!user || !user.id) {
          setOrders([]);
          return;
        }
        const res = await axios.get(`${apiBase}/orders`, {
          params: { user_id: Number(user.id) },
          withCredentials: true,
        });
        setOrders(res.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const startEdit = (order: Order) => {
    setEditingId(order.id);
    // make shallow clone of items for editing
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

  const updateItemDraft = (orderId: number | string, menu_item_id: number, changes: Partial<OrderItem>) => {
    setEditDrafts((s) => {
      const key = String(orderId);
      const items = (s[key] || []).map(it => it.menu_item_id === menu_item_id ? { ...it, ...changes } : it);
      return { ...s, [key]: items };
    });
  };

  const submitEdit = async (orderId: number | string) => {
    if (!user || !user.id) {
      setError('Not authorized');
      return;
    }
    const draft = editDrafts[String(orderId)] || [];
    // build items payload: include quantity (if changed) or delete flag when quantity <= 0 or marked delete
    const itemsPayload = draft.map(it => {
      if (it.quantity <= 0) return { menu_item_id: it.menu_item_id, delete: true };
      return { menu_item_id: it.menu_item_id, quantity: it.quantity };
    });
    try {
      setLoading(true);
      const payload = { user_id: Number(user.id), items: itemsPayload };
      await axios.patch(`${apiBase}/orders/${orderId}`, payload, { withCredentials: true });
      // refresh orders after success
      const res = await axios.get(`${apiBase}/orders`, { params: { user_id: Number(user.id) }, withCredentials: true });
      setOrders(res.data || []);
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
      await axios.delete(`${apiBase}/orders/${orderId}`, {
        data: { user_id: Number(user.id) },
        withCredentials: true,
      });
      setOrders((prev) => prev.filter(o => String(o.id) !== String(orderId)));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders; // add filter/search if desired

  return (
    <>
      <Navbar />
      <main className="my-orders-page">
        <div className="container">
          <h1 className="page-title">Mina Beställningar</h1>

          <div className="search-row">
            <input placeholder="Sök efter Order-Id, namn eller telefon" className="search-input" />
          </div>

          {loading && <div className="muted">Loading…</div>}
          {error && <div className="error">{error}</div>}

          {!loading && filteredOrders.length === 0 && (
            <div className="empty-hero">
              <div className="empty-icon">📦</div>
              <h2>Inga beställningar hittades</h2>
              <p>Börja beställa från vår meny!</p>
              <button className="cta-btn" onClick={() => navigate('/menu')}>Gå till menyn</button>
            </div>
          )}

          {!loading && filteredOrders.map(order => {
            const isEditing = String(editingId) === String(order.id);
            const draftItems = editDrafts[String(order.id)] || order.items;
            const orderTotal = order.items.reduce((s, it) => s + (it.unit_price || 0) * (it.quantity || 0), 0);
            return (
              <div className="order-card" key={order.id}>
                <div className="order-head">
                  <div>
                    <div className="order-title">Order #{order.id} {order.status && <span className="status">{order.status}</span>}</div>
                    <div className="meta">
                      {order.guest_name && <div>Kund: {order.guest_name}</div>}
                      {order.guest_phone && <div>Telefon: {order.guest_phone}</div>}
                      {order.created_at && <div>Beställd: {new Date(order.created_at).toLocaleString()}</div>}
                      {order.pickup_time && <div>Önskad upphämtning: {new Date(order.pickup_time).toLocaleTimeString()}</div>}
                    </div>
                  </div>

                  <div className="order-actions">
                    {!isEditing && <button className="btn-edit" onClick={() => startEdit(order)}>Redigera</button>}
                    {!isEditing && <button className="btn-cancel" onClick={() => cancelOrder(order.id)}>Avbryt beställning</button>}
                  </div>
                </div>

                <div className="order-body">
                  {!isEditing && (
                    <div className="items-list">
                      {order.items.map(it => (
                        <div className="item-row" key={it.menu_item_id}>
                          <div className="item-left">{it.quantity}x {it.name ?? `#${it.menu_item_id}`}</div>
                          <div className="item-right">{(it.unit_price || 0) * it.quantity} kr</div>
                        </div>
                      ))}
                      <div className="order-total">Totalt <strong>{orderTotal} kr</strong></div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="edit-form">
                      {draftItems.map(it => (
                        <div className="edit-row" key={it.menu_item_id}>
                          <div className="edit-name">{it.name ?? `#${it.menu_item_id}`}</div>
                          <div className="edit-controls">
                            <input
                              type="number"
                              min={0}
                              value={it.quantity}
                              onChange={(e) => updateItemDraft(order.id, it.menu_item_id, { quantity: Math.max(0, Number(e.target.value || 0)) })}
                            />
                            <label className="mark-delete">
                              <input
                                type="checkbox"
                                checked={it.quantity <= 0}
                                onChange={(e) => updateItemDraft(order.id, it.menu_item_id, { quantity: e.target.checked ? 0 : Math.max(1, it.quantity || 1) })}
                              /> Ta bort
                            </label>
                          </div>
                        </div>
                      ))}

                      <div className="edit-actions">
                        <button className="btn-save" onClick={() => submitEdit(order.id)} disabled={loading}>Spara ändringar</button>
                        <button className="btn-ghost" onClick={() => cancelEdit(order.id)}>Avbryt</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}