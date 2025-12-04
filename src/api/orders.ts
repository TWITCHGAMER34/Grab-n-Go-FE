import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL;

/**
 * Fetch orders for a user.
 * Returns the response data (array of orders) or throws.
 */
export async function fetchOrders(userId?: number) {
    if (!userId) return [];
    const res = await axios.get(`${apiBase}/orders`, {
        params: { user_id: Number(userId) },
        withCredentials: true,
    });
    return res.data;
}

/**
 * Create a new order.
 * `payload` should match the server expected shape.
 */
export async function createOrder(payload: Record<string, any>) {
    const res = await axios.post(`${apiBase}/orders`, payload, { withCredentials: true });
    return res.data;
}

/**
 * Update an existing order.
 * `payload` should contain fields to patch (e.g. items).
 */
export async function updateOrder(orderId: string | number, payload: Record<string, any>) {
    const res = await axios.patch(`${apiBase}/orders/${orderId}`, payload, { withCredentials: true });
    return res.data;
}

/**
 * Delete / cancel an order.
 * Optionally pass `userId` in the request body as required by the API.
 */
export async function deleteOrder(orderId: string | number, userId?: number) {
    const res = await axios.delete(`${apiBase}/orders/${orderId}`, {
        data: userId ? { user_id: Number(userId) } : undefined,
        withCredentials: true,
    });
    return res.data;
}
