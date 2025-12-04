// File: `src/pages/orderSuccess/PromoCta.tsx`


export default function PromoCta({ onStart }: { onStart: () => void }) {
    return (
        <section className="order-success__promo">
            <div className="order-success__promo-inner container">
                <h2 className="order-success__promo-title">Hungrig? Beställ nu!</h2>
                <p className="order-success__promo-sub">Enkel online-beställning. Snabb hämtning. Fantastisk mat.</p>
                <button className="order-success__cta-button" onClick={onStart}>Börja beställa</button>
            </div>
        </section>
    );
}