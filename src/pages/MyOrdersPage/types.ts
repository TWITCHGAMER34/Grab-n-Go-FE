// File: `src/pages/MyOrdersPage/types.ts`
export type OrderItem = {
    menu_item_id: number;
    name?: string;
    quantity: number;
    unit_price?: number;
};

export type Order = {
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
