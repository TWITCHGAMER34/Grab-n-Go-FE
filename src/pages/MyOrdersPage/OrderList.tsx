// File: `src/pages/MyOrdersPage/OrderList.tsx`
import type {Order} from './types';
import OrderCard from './OrderCard';
import {Package} from "lucide-react";
import {useNavigate} from "react-router-dom";


type Props = {
    orders: Order[];
    loading: boolean;
    editingId: number | string | null;
    editDrafts: Record<string, import('./types').OrderItem[]>;
    startEdit: (o: Order) => void;
    cancelEdit: (id: number | string) => void;
    updateItemDraft: (orderId: number | string, menu_item_id: number, changes: Partial<import('./types').OrderItem>) => void;
    submitEdit: (orderId: number | string) => Promise<void>;
    cancelOrder: (orderId: number | string) => Promise<void>;
};

export default function OrderList({
                                      orders,
                                      loading,
                                      editingId,
                                      editDrafts,
                                      startEdit,
                                      cancelEdit,
                                      updateItemDraft,
                                      submitEdit,
                                      cancelOrder,
                                  }: Props) {
    const navigate = useNavigate();
    if (!loading && orders.length === 0) {
        return (
            <div className="my-orders-page__empty-hero">
                <div className="my-orders-page__empty-icon"><Package size={70}/></div>
                <h2>Inga beställningar hittades</h2>
                <p>Börja beställa från vår meny!</p>
                <button className="my-orders-page__empty-btn" onClick={() => navigate('/menu')}>Gå till menyn</button>

            </div>
        );
    }

    return (
        <>
            {orders.map(order => {
                const isEditing = String(editingId) === String(order.id);
                const draftItems = editDrafts[String(order.id)] || order.items;
                return (
                    <OrderCard
                        key={order.id}
                        order={order}
                        isEditing={isEditing}
                        draftItems={draftItems}
                        loading={loading}
                        startEdit={startEdit}
                        cancelEdit={cancelEdit}
                        updateItemDraft={updateItemDraft}
                        submitEdit={submitEdit}
                        cancelOrder={cancelOrder}
                    />
                );
            })}
        </>
    );
}
