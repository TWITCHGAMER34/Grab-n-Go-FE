// File: `src/pages/basket/OrderPanel.tsx`
import React from 'react';

export default function OrderPanel({
                                       user,
                                       total,
                                       email,
                                       setEmail,
                                       pickup,
                                       setPickup,
                                       loading,
                                       serverError,
                                       onSubmit,
                                       onGotoLogin,
                                       onContinueShopping,
                                   }: {
    user: any;
    total: number;
    email: string;
    setEmail: (v: string) => void;
    pickup: string;
    setPickup: (v: string) => void;
    loading: boolean;
    serverError: string | null;
    onSubmit: (e?: React.FormEvent) => void;
    onGotoLogin: () => void;
    onContinueShopping: () => void;
}) {
    if (!user || !user.id) {
        return (
            <div className="basket__login-cta">
                <p>Du måste vara inloggad för att lägga en beställning.</p>
                <div className="basket__cta-actions">
                    <button className="basket__btn-primary" onClick={onGotoLogin}>Logga in / Skapa konto</button>
                    <button className="basket__btn-ghost" onClick={onContinueShopping}>Fortsätt handla</button>
                </div>
                {serverError && <div className="basket__server-error">{serverError}</div>}
            </div>
        );
    }

    return (
        <div className="basket__order-card">
            <h3>Slutför beställning</h3>

            <form className="basket__order-form" onSubmit={onSubmit} noValidate>
                <label className="basket__form-row">
                    Epost (valfritt)
                    <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                           disabled={loading} placeholder="din@email.se"/>
                </label>

                <label className="basket__form-row">
                    Önskad upphämtningstid
                    <input name="pickup" type="datetime-local" value={pickup}
                           onChange={(e) => setPickup(e.target.value)} disabled={loading}/>
                </label>

                <div className="basket__summary-rows">
                    <div className="basket__summary-line"><span>Delsumma</span><span>{total.toFixed(0)} kr</span></div>
                    <div className="basket__summary-line basket__summary-line--total"><strong>Totalt</strong><strong
                        className="basket__summary-line--total--color">{total.toFixed(0)} kr</strong></div>
                </div>

                {serverError && <div className="basket__server-error">{serverError}</div>}

                <button type="submit" className="basket__submit-btn" disabled={loading}>
                    {loading ? 'Skickar…' : 'Lägg beställning'}
                </button>

                <p className="basket__pickup-hint">Beräknad hämtningstid: 15-20 min</p>
            </form>
        </div>
    );
}