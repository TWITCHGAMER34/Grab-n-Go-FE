// File: `src/pages/orderSuccess/OrderSuccess.tsx` (typescript)
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/NavBar';
import Footer from '../../components/footer/Footer';
import './orderSuccess.scss';

export default function OrderSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const stateOrderId = (location.state as any)?.orderId;
    const queryId = new URLSearchParams(location.search).get('id');
    const orderId = stateOrderId ?? queryId ?? null;

    return (
        <>
            <Navbar />
            <main className="order-success-page">
                <div className="container">
                    <div className="success-card">
                        <div className="success-icon" aria-hidden="true">✓</div>
                        <h1 className="title">Tack — din beställning är mottagen!</h1>
                        {orderId && <div className="order-id">Ordernummer: <strong>{orderId}</strong></div>}
                        <p className="subtitle">
                            Vi förbereder din beställning. Du får en notis när den är klar för upphämtning.
                        </p>

                        <div className="actions">
                            <button className="btn btn-primary" onClick={() => navigate('/menu')}>Fortsätt handla</button>
                            <button className="btn btn-ghost" onClick={() => navigate('/orders')}>Mina beställningar</button>
                        </div>
                    </div>
                </div>
            </main>

            <section className="promo-cta">
                <div className="container cta-inner">
                    <h2>Hungrig? Beställ nu!</h2>
                    <p>Enkel online-beställning. Snabb hämtning. Fantastisk mat.</p>
                    <button className="cta-button" onClick={() => navigate('/menu')}>Börja beställa</button>
                </div>
            </section>

            <Footer />
        </>
    );
}