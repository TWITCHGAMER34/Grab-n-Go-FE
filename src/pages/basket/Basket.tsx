// File: `src/pages/basket/Basket.tsx`
/**
 * Basket page
 *
 * Renders the user's shopping basket, allows quantity updates and removals,
 * collects contact/pickup info and submits an order to the API.
 *
 * - Uses `useCart` for local cart state and persistence.
 * - Requires an authenticated `user` from `useAuth` to place orders.
 * - Validates and transforms cart items into the backend payload shape.
 * - Clears the cart and navigates to success page on successful order.
 */
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

/**
 * Basket component
 *
 * @returns JSX element for the basket page
 */
export default function Basket() {
    const navigate = useNavigate();
    // Cart context: items and actions
    const { state, removeItem, setQty, clear } = useCart();
    // Auth context: current user (may be null)
    const { user } = useAuth();

    // Ensure `items` is always an array to simplify usage below.
    const items = state.items ?? [];
    const isEmpty = items.length === 0;

    // Controlled form state for optional contact info
    const [email, setEmail] = useState('');
    const [pickup, setPickup] = useState('');
    // UI state for API operations
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    // Derived total price (safely handle missing price/qty)
    const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);

    /**
     * handleQty
     *
     * Normalize and apply a quantity update for a cart item.
     * - Ensures integer qty >= 1.
     */
    const handleQty = (id: string, qty: number) => {
        const safeQty = Math.max(1, Math.floor(qty || 1));
        setQty(id, safeQty);
    };

    // Remove item wrapper
    const handleRemove = (id: string) => removeItem(id);

    /**
     * handleSubmit
     *
     * Validate user and cart, transform items to backend shape and POST an order.
     * Handles loading/error UI and clears cart + navigates on success.
     */
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setServerError(null);

        // Require authentication for orders
        if (!user || !user.id) {
            setServerError('You must be logged in to place an order.');
            return;
        }
        if (items.length === 0) {
            setServerError('Cart is empty.');
            return;
        }

        // Transform cart items to the API expected payload.
        const apiItems = items
            .map((i) => {
                const menu_item_id = Number(i.id);
                // Skip items with non-numeric ids (invalid)
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
            // Build payload; pickup_time is optional and converted to ISO when present.
            const payload = {
                user_id: Number(user.id),
                pickup_time: pickup ? new Date(pickup).toISOString() : null,
                staff_note: '',
                items: apiItems,
                contact_email: email ? email.trim() : undefined,
            } as Record<string, any>;

            // POST the order; credentials included for cookie-based auth
            await axios.post(`${import.meta.env.VITE_API_URL}/orders`, payload, { withCredentials: true });

            // On success clear the cart and navigate to confirmation
            clear();
            navigate('/order-success');
        } catch (err: any) {
            // Prefer server-provided message when available
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
                    {/* Header only shown when there are items */}
                    {!isEmpty && (
                        <header className="basket__header">
                            <button className="basket__back-link" onClick={() => navigate('/menu')}>← Tillbaka till menyn</button>
                            <h1 className="basket__title">Din varukorg</h1>
                        </header>
                    )}

                    {isEmpty ? (
                        // Empty state: call-to-action to the menu
                        <section className="basket__cart-list">
                            <EmptyHero onGotoMenu={() => navigate('/menu')} />
                        </section>
                    ) : (
                        // Filled state: list + order panel
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
