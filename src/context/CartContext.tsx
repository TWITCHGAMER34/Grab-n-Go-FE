// File: `src/context/CartContext.tsx`
/**
 * Cart context and provider
 *
 * Provides a simple cart store for the application:
 * - Stores an array of `CartItem` in local state and persists it to `localStorage`.
 * - Hydrates initial state from `localStorage` on mount.
 * - Exposes actions: `addItem`, `removeItem`, `setQty`, `clear` and a `totalItems` helper.
 *
 * Notes:
 * - Quantities are clamped to a minimum of 1.
 * - `STORAGE_KEY` versioning allows safe migrations in the future.
 */
import { createContext, useContext, useReducer, useEffect } from "react";
import type { ReactNode } from "react";

type CartItem = {
    id: string;
    name: string;
    price?: number;
    qty: number;
    image?: string | null;
};

type State = {
    items: CartItem[];
};

type Action =
    | { type: "HYDRATE"; payload: State }
    | { type: "ADD_ITEM"; payload: CartItem }
    | { type: "REMOVE_ITEM"; payload: { id: string } }
    | { type: "SET_QTY"; payload: { id: string; qty: number } }
    | { type: "CLEAR" };

const STORAGE_KEY = "cart:v1";

const initialState: State = { items: [] };

/**
 * Reducer implements cart mutation logic.
 * - HYDRATE: replace state with persisted state
 * - ADD_ITEM: append new item or increase qty of existing
 * - REMOVE_ITEM: remove by id
 * - SET_QTY: set item qty (clamped to >= 1)
 * - CLEAR: empty cart
 */
function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "HYDRATE":
            // Replace current state with persisted state (used on mount)
            return action.payload;
        case "ADD_ITEM": {
            // If item exists, increase its qty, otherwise append new item
            const existing = state.items.find((it) => it.id === action.payload.id);
            if (existing) {
                return {
                    items: state.items.map((it) =>
                        it.id === action.payload.id ? { ...it, qty: it.qty + action.payload.qty } : it
                    ),
                };
            }
            return { items: [...state.items, action.payload] };
        }
        case "REMOVE_ITEM":
            // Filter out the item with provided id
            return { items: state.items.filter((it) => it.id !== action.payload.id) };
        case "SET_QTY":
            // Set quantity for matching item; ensure minimum of 1 to avoid zero/negative quantities
            return {
                items: state.items.map((it) =>
                    it.id === action.payload.id ? { ...it, qty: Math.max(1, action.payload.qty) } : it
                ),
            };
        case "CLEAR":
            // Reset cart to empty
            return { items: [] };
        default:
            return state;
    }
}

const CartContext = createContext<{
    state: State;
    addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
    removeItem: (id: string) => void;
    setQty: (id: string, qty: number) => void;
    clear: () => void;
    totalItems: number;
} | null>(null);

/**
 * CartProvider
 *
 * Wrap the app to provide cart state and actions.
 * - Hydrates from localStorage once on mount.
 * - Persists to localStorage whenever `state` changes.
 */
export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Hydrate from localStorage on first render. Errors are ignored to avoid breaking the app.
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as State;
                dispatch({ type: "HYDRATE", payload: parsed });
            }
        } catch (_) {
            // Intentionally ignore parse/storage errors (corrupted data or restricted storage).
        }
    }, []);

    // Persist state to localStorage whenever it changes.
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (_) {
            // Ignore write errors (e.g. quota exceeded, private mode).
        }
    }, [state]);

    // Action helpers for consumers.

    // Add an item; default qty is 1 and clamped to >= 1.
    const addItem = (item: Omit<CartItem, "qty">, qty = 1) =>
        dispatch({
            type: "ADD_ITEM",
            payload: { ...item, qty: Math.max(1, qty) },
        });

    // Remove item by id.
    const removeItem = (id: string) => dispatch({ type: "REMOVE_ITEM", payload: { id } });

    // Set exact qty for an item (clamped to >= 1).
    const setQty = (id: string, qty: number) => dispatch({ type: "SET_QTY", payload: { id, qty } });

    // Clear the cart completely.
    const clear = () => dispatch({ type: "CLEAR" });

    // Derived helper: total number of items in cart (sums quantities).
    const totalItems = state.items.reduce((s, it) => s + it.qty, 0);

    return (
        <CartContext.Provider value={{ state, addItem, removeItem, setQty, clear, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

/**
 * useCart
 *
 * Hook to consume the cart context. Throws when used outside `CartProvider`.
 */
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
