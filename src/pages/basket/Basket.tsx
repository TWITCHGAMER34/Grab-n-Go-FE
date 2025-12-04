// File: `src/pages/basket/Basket.tsx`
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './basket.scss';
import { ShoppingCart } from 'lucide-react';
import Navbar from '../../components/navbar/NavBar.tsx';
import Footer from '../../components/footer/Footer.tsx';

export default function Basket() {
    const navigate = useNavigate();
    const { state, removeItem, setQty, clear } = useCart();
    const { user } = useAuth(); // read user from auth context
    const items = state.items ?? [];
    const isEmpty = items.length === 0;

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [pickup, setPickup] = useState('');
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);

    const handleQty = (id: string, qty: number) => {
        const safeQty = Math.max(1, Math.floor(qty || 1));
        setQty(id, safeQty);
    };

    const handleRemove = (id: string) => removeItem(id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        // if user is not logged in, require guest fields
        if (!user && (!name.trim() || !phone.trim())) {
            setServerError('Please fill contact details and ensure cart is not empty.');
            return;
        }
        if (items.length === 0) {
            setServerError('Cart is empty.');
            return;
        }

        const apiItems = items
            .map((i) => {
                const menu_item_id = Number(i.id);
                if (Number.isNaN(menu_item_id)) return null;
                const itemPayload: { menu_item_id: number; quantity: number; unit_price?: number } = {
                    menu_item_id,
                    quantity: i.qty,
                };
                if (typeof i.price === 'number') itemPayload.unit_price = i.price;
                return itemPayload;
            })
            .filter(Boolean) as { menu_item_id: number; quantity: number; unit_price?: number }[];

        if (apiItems.length === 0) {
            setServerError('Cart contains invalid items.');
            return;
        }

        setLoading(true);
        try {
            // base payload
            const basePayload = {
                pickup_time: pickup ? new Date(pickup).toISOString() : null,
                staff_note: '',
                items: apiItems,
            } as Record<string, any>;

            // include user_id when available, otherwise include guest fields
            const payload = user && user.id
                ? { ...basePayload, user_id: Number(user.id) }
                : { ...basePayload, guest_name: name.trim(), guest_phone: phone.trim() };

            await axios.post(`${import.meta.env.VITE_API_URL}/orders`, payload, { withCredentials: true });

            clear();
            navigate('/order-success');
        } catch (err: any) {
            setServerError(err?.response?.data?.message ?? err?.message ?? 'Order failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className={`basket-page ${isEmpty ? 'empty-state' : 'filled-state'}`}>
                <div className="container">
                    {!isEmpty && (
                        <header className="basket-header">
                            <button className="back-link" onClick={() => navigate('/menu')}>← Tillbaka till menyn
                            </button>
                            <h1 className="page-title">Din varukorg</h1>
                        </header>
                    )}

                    {isEmpty ? (
                        <section className="cart-list">
                            <div className="empty-hero">
                                <ShoppingCart size={60}/>
                                <h2 className="empty-title">Din varukorg är tom</h2>
                                <p className="empty-sub">Lägg till några läckra rätter från vår meny</p>
                                <button type="button" className="cta-btn" onClick={() => navigate('/menu')}>Gå till
                                    menyn
                                </button>
                            </div>
                        </section>
                    ) : (
                        <div className="basket-grid">
                            <section className="cart-list">
                                {items.map((it) => (
                                    <article className="cart-item" key={it.id}>
                                        <div className="item-left">
                                            {it.image && <img src={it.image} alt={it.name} className="item-image"/>}
                                            <div className="item-meta">
                                                <div className="item-name">{it.name}</div>
                                                <div className="item-price">{(it.price ?? 0).toFixed(0)} kr / st</div>
                                            </div>
                                        </div>

                                        <div className="item-right">
                                            <div className="qty-controls">
                                                <button type="button"
                                                        onClick={() => handleQty(it.id, Math.max(1, it.qty - 1))}
                                                        disabled={loading}>−
                                                </button>
                                                <input type="number" min={1} value={it.qty}
                                                       onChange={(e) => handleQty(it.id, Math.max(1, Number(e.target.value || 1)))}/>
                                                <button type="button" onClick={() => handleQty(it.id, it.qty + 1)}
                                                        disabled={loading}>+
                                                </button>
                                            </div>
                                            <div className="item-subtotal">{((it.price ?? 0) * it.qty).toFixed(0)} kr
                                            </div>
                                            <button className="remove" aria-label="Remove"
                                                    onClick={() => handleRemove(it.id)} disabled={loading}>🗑️
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </section>

                            <aside className="order-panel">
                                <div className="order-card">
                                    <h3>Slutför beställning</h3>

                                    <form className="order-form" onSubmit={handleSubmit} noValidate>
                                        <label className="form-row">
                                            Namn *
                                            <input name="name" value={name} onChange={(e) => setName(e.target.value)}
                                                   disabled={loading} required placeholder="Ditt namn"/>
                                        </label>

                                        <label className="form-row">
                                            Telefon *
                                            <input name="phone" type="tel" value={phone}
                                                   onChange={(e) => setPhone(e.target.value)} disabled={loading}
                                                   required placeholder="070-123 45 67"/>
                                        </label>

                                        <label className="form-row">
                                            Epost (valfritt)
                                            <input name="email" type="email" value={email}
                                                   onChange={(e) => setEmail(e.target.value)} disabled={loading}
                                                   placeholder="din@email.se"/>
                                        </label>

                                        <label className="form-row">
                                            Önskad upphämtningstid
                                            <input name="pickup" type="datetime-local" value={pickup}
                                                   onChange={(e) => setPickup(e.target.value)} disabled={loading}/>
                                        </label>

                                        <div className="summary-rows">
                                            <div className="summary-line">
                                                <span>Delsumma</span><span>{total.toFixed(0)} kr</span></div>
                                            <div className="summary-line total">
                                                <strong>Totalt</strong><strong>{total.toFixed(0)} kr</strong></div>
                                        </div>

                                        {serverError && <div className="server-error">{serverError}</div>}

                                        <button type="submit" className="submit-btn"
                                                disabled={loading || items.length === 0}>
                                            {loading ? 'Skickar…' : 'Lägg beställning'}
                                        </button>

                                        <p className="pickup-hint">Beräknad hämtningstid: 15-20 min</p>
                                    </form>
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </main>
            <Footer/>
        </>
    );
}
