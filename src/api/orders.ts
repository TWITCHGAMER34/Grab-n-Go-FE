// File: src/api/orders.ts
import axios from 'axios';
import type { Order, OrderItem } from '../types/Order';

const apiBase = import.meta.env.VITE_API_URL;

function mapStatus(apiStatus: string): Order['status'] {
    switch (apiStatus) {
        case 'pending':
            return 'unhandled';
        case 'processing':
            return 'processing';
        case 'done':
            return 'done';
        case 'waiting':
            return 'waiting';
        default:
            return 'unhandled';
    }
}

function parseToDate(input?: unknown): Date | null {
    if (!input || typeof input !== 'string') return null;
    let s = input.trim();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?/.test(s)) {
        s = s.replace(' ', 'T');
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}

function formatDateTime(input?: unknown): string | undefined {
    const d = parseToDate(input);
    if (!d) return undefined;
    return new Intl.DateTimeFormat('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

function mapItem(it: any): OrderItem {
    const base: any = {
        name: it.menu_item_name ?? it.name ?? `#${it.menu_item_id ?? it.id ?? 'unknown'}`,
        qty: Number(it.quantity ?? it.qty ?? 0),
        price: Number(it.unit_price ?? it.price ?? 0),
    };

    // Preserve backend identifiers and notes on the mapped item (kept as `any` on the object)
    if (it.menu_item_id ?? it.id) {
        // map backend menu item identifier as `menu_item_id` and also keep `id` if present
        if (it.menu_item_id) base.menu_item_id = it.menu_item_id;
        if (it.id && !base.menu_item_id) base.id = it.id;
        // also keep canonical `id` if backend used that for menu item
        if (it.id) base.id = it.id;
    }
    if (it.order_item_id) base.order_item_id = it.order_item_id;
    if (it.notes) base.notes = it.notes;

    return base as OrderItem;
}

function mapOrder(api: any): Order {
    const user = api.user ?? null;

    const customer = user?.name;

    return {
        id: String(api.id),
        customer,
        phone: api.guest_phone ?? user?.phone ?? api.phone ?? undefined,
        email: api.email ?? user?.email ?? undefined,
        createdAt: formatDateTime(api.created_at) ?? String(api.created_at ?? ''),
        pickupAt: formatDateTime(api.pickup_time) ?? undefined,
        items: Array.isArray(api.items) ? api.items.map(mapItem) : [],
        total: Number(api.total ?? 0),
        note: api.staff_note ?? api.note ?? null,
        status: mapStatus(api.status),
    };
}

/**
 * Fetch orders for a user and map to frontend `Order` shape.
 */
export async function fetchOrders(userId?: number): Promise<Order[]> {
    if (!userId) return [];
    const res = await axios.get(`${apiBase}/orders?user_id=${Number(userId)}`, {
        withCredentials: true,
    });
    const data = res.data;
    if (!Array.isArray(data)) return [];
    return data.map(mapOrder);
}

/**
 * Fetch all orders (for staff/dashboard) and map to frontend `Order` shape.
 */
export async function fetchAllOrders(): Promise<Order[]> {
    const res = await axios.get(`${apiBase}/staff/all`, { withCredentials: true });
    const data = res.data;
    if (!Array.isArray(data)) return [];
    return data.map(mapOrder);
}

export async function updateOrder(orderId: string | number, payload: Record<string, any>) {
    const res = await axios.patch(`${apiBase}/orders/${orderId}`, payload, { withCredentials: true });
    return res.data;
}

export async function addComment(orderId: string | number, comment: string) {
    const res = await axios.post(`${apiBase}/staff/addComment/${orderId}`, { comment }, { withCredentials: true });
    return res.data;
}

export async function deleteOrder(orderId: string | number, userId?: number) {
    const res = await axios.delete(`${apiBase}/orders/${orderId}`, {
        data: userId ? { user_id: Number(userId) } : undefined,
        withCredentials: true,
    });
    return res.data;
}
