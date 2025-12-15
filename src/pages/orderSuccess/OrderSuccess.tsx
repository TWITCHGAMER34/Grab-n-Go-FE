// File: `src/pages/orderSuccess/OrderSuccess.tsx`
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/NavBar';
import Footer from '../../components/footer/Footer';
import './orderSuccess.scss';
import SuccessCard from './SuccessCard';
import PromoCta from './PromoCta';
import Seo from "../../components/Seo.tsx";

export default function OrderSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const stateOrderId = (location.state as any)?.orderId;
    const queryId = new URLSearchParams(location.search).get('id');
    const orderId = stateOrderId ?? queryId ?? null;

    return (
        <>
            <Seo title="Order Sent" description="" />
            <Navbar />
            <main className="order-success">
                <div className="order-success__container container">
                    <SuccessCard
                        orderId={orderId}
                        onContinueShopping={() => navigate('/menu')}
                        onViewOrders={() => navigate('/orders')}
                    />
                </div>
            </main>

            <PromoCta onStart={() => navigate('/menu')} />

            <Footer />
        </>
    );
}