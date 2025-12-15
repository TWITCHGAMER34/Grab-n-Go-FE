// File: `src/pages/basket/Basket.tsx`
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './basket.scss';
import Navbar from '../../components/navbar/NavBar.tsx';
import Footer from '../../components/footer/Footer.tsx';
import BasketList from './BasketList';
import OrderPanel from './OrderPanel';
import EmptyHero from './EmptyHero';
import Seo from "../../components/Seo.tsx";

export default function Basket() {
    const navigate = useNavigate();
    const { state, removeItem, setQty, clear } = useCart();
    const { user } = useAuth();
    const items = state.items ?? [];
    const isEmpty = items.length === 0;

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

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setServerError(null);

        if (!user || !user.id) {
            setServerError('You must be logged in to place an order.');
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
            const payload = {
                user_id: Number(user.id),
                pickup_time: pickup ? new Date(pickup).toISOString() : null,
                staff_note: '',
                items: apiItems,
                contact_email: email ? email.trim() : undefined,
            } as Record<string, any>;

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
            <Seo title="Basket" description="Your basket" />
            <Navbar />
            <main className={`basket ${isEmpty ? 'basket--empty' : 'basket--filled'}`}>
                <div className="basket__container container">
                    {!isEmpty && (
                        <header className="basket__header">
                            <button className="basket__back-link" onClick={() => navigate('/menu')}>← Tillbaka till menyn</button>
                            <h1 className="basket__title">Din varukorg</h1>
                        </header>
                    )}

                    {isEmpty ? (
                        <section className="basket__cart-list">
                            <EmptyHero onGotoMenu={() => navigate('/menu')} />
                        </section>
                    ) : (
                        <div className="basket__grid">
                            <section className="basket__cart-list">
                                <BasketList
                                    items={items}
                                    loading={loading}
                                    onQtyChange={handleQty}
                                    onRemove={handleRemove}
                                />
                            </section>

                            <aside className="basket__order-panel">
                                <OrderPanel
                                    user={user}
                                    total={total}
                                    email={email}
                                    setEmail={setEmail}
                                    pickup={pickup}
                                    setPickup={setPickup}
                                    loading={loading}
                                    serverError={serverError}
                                    onSubmit={handleSubmit}
                                    onGotoLogin={() => navigate('/login')}
                                    onContinueShopping={() => navigate('/menu')}
                                />
                            </aside>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}