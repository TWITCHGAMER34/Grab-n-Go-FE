export type OrderItem = { name: string; qty: number; price: number };

export type Order = {
    id: string;
    customer: string;
    phone?: string;
    email?: string;
    createdAt?: string;
    pickupAt?: string;
    items: OrderItem[];
    locked: boolean;
    total: number;
    note?: string | null;
    status: string;
};
