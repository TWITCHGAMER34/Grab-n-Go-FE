// File: `src/api/orders.ts`
/**
 * Orders API helpers
 *
 * Provides functions to fetch and mutate orders from the backend and
 * utilities to normalize API responses into the application's `Order`
 * and `OrderItem` shapes.
 *
 * - Uses `import.meta.env.VITE_API_URL` as the base for HTTP requests.
 * - Uses `axios` with `withCredentials` for cookie/auth forwarding.
 * - Mapping helpers are defensive: they tolerate missing/varied field names
 *   from different backend responses and normalize dates and status labels.
 */

import axios from 'axios';
import type { Order, OrderItem } from '../types/Order';

const apiBase = import.meta.env.VITE_API_URL;

/**
 * Convert API status string to the localized frontend label used in `Order.status`.
 */
const mapStatus = (apiStatus: string): Order['status'] => {
    switch (apiStatus) {
        case 'pending':
            return 'Obehandlad';
        case 'in_kitchen':
            return 'Tillagas';
        case 'ready':
            return 'Redo';
        case 'completed':
            return 'Slutförd';
        default:
            // Treat unknown statuses as pending/unhandled
            return 'Obehandlad';
    }
};

/**
 * Parse a date/time value returned by the API into a `Date` or `null`.
 * Accepts ISO strings and a common "YYYY-MM-DD HH:MM(:SS)?" variant by converting
 * the space to a `T` so `Date` can parse it reliably in modern engines.
 */
function parseToDate(input?: unknown): Date | null {
    if (!input || typeof input !== 'string') return null;
    let s = input.trim();

    // Accept "YYYY-MM-DD HH:MM" and convert to ISO-like "YYYY-MM-DDTHH:MM"
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?/.test(s)) {
        s = s.replace(' ', 'T');
    }

    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date/time string from the API into a localized Swedish display string.
 * Returns `undefined` if the input cannot be parsed.
 */
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

/**
 * Normalize an order item object from the API into `OrderItem`.
 * Handles variations in field names (`menu_item_name` vs `name`, `quantity` vs `qty`, etc.)
 */
function mapItem(it: any): OrderItem {
    const base: any = {
        // prefer explicit menu item name, fallback to generic name or id placeholder
        name: it.menu_item_name ?? it.name ?? `#${it.menu_item_id ?? it.id ?? 'unknown'}`,
        qty: Number(it.quantity ?? it.qty ?? 0),
        price: Number(it.unit_price ?? it.price ?? 0),
    };

    // Preserve ids if present; favor menu_item_id for linking back to menu
    if (it.menu_item_id ?? it.id) {
        if (it.menu_item_id) base.menu_item_id = it.menu_item_id;
        if (it.id && !base.menu_item_id) base.id = it.id;
        if (it.id) base.id = it.id;
    }
    if (it.order_item_id) base.order_item_id = it.order_item_id;
    if (it.notes) base.notes = it.notes;

    return base as OrderItem;
}

/**
 * Convert a raw API order object into the application's `Order` shape.
 * Normalizes user/contact fields, date formatting, item mapping and status labels.
 */
function mapOrder(api: any): Order {
    const user = api.user;
    const customer = user?.name;

    // Normalize locked flag: backend may return numeric 1/0
    const lockedRaw = api.locked;
    const locked = lockedRaw === 1;

    return {
        id: String(api.id),
        customer,
        phone: user?.phone,
        email: user?.email,
        // Use formatted date where possible; fall back to raw value string to keep UI predictable
        createdAt: formatDateTime(api.created_at) ?? String(api.created_at ?? ''),
        pickupAt: formatDateTime(api.pickup_time) ?? undefined,
        items: Array.isArray(api.items) ? api.items.map(mapItem) : [],
        total: Number(api.total ?? 0),
        note: api.staff_note ?? null,
        status: mapStatus(api.status),
        locked,
    };
}

/**
 * Fetch orders for a specific user.
 * Returns an empty array if `userId` is falsy or if the response is not an array.
 */
export async function fetchOrders(userId?: number): Promise<Order[]> {
    if (!userId) return [];
    const res = await axios.get(`${apiBase}/orders?user_id=${Number(userId)}`, {
        withCredentials: true,
    });

    // Log raw response for debugging; caller consumes normalized result
    console.log('Fetched orders response:', res.data);

    const data = res.data;
    if (!Array.isArray(data)) return [];
    return data.map(mapOrder);
}

/**
 * Fetch all orders (staff endpoint).
 * Returns an empty array if response is not an array.
 */
export async function fetchAllOrders(): Promise<Order[]> {
    const res = await axios.get(`${apiBase}/staff/all`, { withCredentials: true });
    const data = res.data;
    if (!Array.isArray(data)) return [];
    return data.map(mapOrder);
}

/**
 * Patch order fields. Returns the server response body.
 */
export async function updateOrder(orderId: string | number, payload: Record<string, any>) {
    const res = await axios.patch(`${apiBase}/orders/${orderId}`, payload, { withCredentials: true });
    return res.data;
}

/**
 * Add a staff comment to an order. Returns the server response body.
 */
export async function addComment(orderId: string | number, comment: string) {
    const res = await axios.post(`${apiBase}/staff/addComment/${orderId}`, { comment }, { withCredentials: true });
    return res.data;
}

/**
 * Lock an order for staff (prevents concurrent edits). Returns server response.
 */
export async function lockOrder(orderId: string | number) {
    const res = await axios.post(`${apiBase}/staff/lock-order/${orderId}`, {}, { withCredentials: true });
    return res.data;
}

/**
 * Delete an order. Optionally include `userId` in the request body for authorization.
 * Returns the server response body.
 */
export async function deleteOrder(orderId: string | number, userId?: number) {
    const res = await axios.delete(`${apiBase}/orders/${orderId}`, {
        data: userId ? { user_id: Number(userId) } : undefined,
        withCredentials: true,
    });
    return res.data;
}

/**
 * Update order status via staff endpoint. Returns server response body.
 */
export async function updateStatus(orderId: string | number, status: string) {
    const res = await axios.patch(`${apiBase}/staff/status/${orderId}`, { status }, { withCredentials: true });
    return res.data;
}
