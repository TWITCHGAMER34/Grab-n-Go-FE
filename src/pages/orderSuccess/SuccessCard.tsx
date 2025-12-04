
export default function SuccessCard({
                                        orderId,
                                        onContinueShopping,
                                        onViewOrders,
                                    }: {
    orderId: string | null;
    onContinueShopping: () => void;
    onViewOrders: () => void;
}) {
    return (
        <div className="order-success__card">
            <div className="order-success__icon" aria-hidden="true">✓</div>
            <h1 className="order-success__title">Tack — din beställning är mottagen!</h1>

            {orderId && (
                <div className="order-success__order-id">
                    Ordernummer: <strong>{orderId}</strong>
                </div>
            )}

            <p className="order-success__subtitle">
                Vi förbereder din beställning. Du får en notis när den är klar för upphämtning.
            </p>

            <div className="order-success__actions">
                <button className="order-success__btn order-success__btn--primary" onClick={onContinueShopping}>
                    Fortsätt handla
                </button>
                <button className="order-success__btn order-success__btn--ghost" onClick={onViewOrders}>
                    Mina beställningar
                </button>
            </div>
        </div>
    );
}