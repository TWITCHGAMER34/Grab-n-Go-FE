// File: src/context/CartContext.tsx
import {createContext, useContext, useReducer, useEffect} from "react";
import type {ReactNode} from "react";

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

const initialState: State = {items: []};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "HYDRATE":
            return action.payload;
        case "ADD_ITEM": {
            const existing = state.items.find((it) => it.id === action.payload.id);
            if (existing) {
                return {
                    items: state.items.map((it) =>
                        it.id === action.payload.id ? {...it, qty: it.qty + action.payload.qty} : it
                    ),
                };
            }
            return {items: [...state.items, action.payload]};
        }
        case "REMOVE_ITEM":
            return {items: state.items.filter((it) => it.id !== action.payload.id)};
        case "SET_QTY":
            return {
                items: state.items.map((it) => (it.id === action.payload.id ? {
                    ...it,
                    qty: Math.max(1, action.payload.qty)
                } : it)),
            };
        case "CLEAR":
            return {items: []};
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

export function CartProvider({children}: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // hydrate from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as State;
                dispatch({type: "HYDRATE", payload: parsed});
            }
        } catch (_) {
            // ignore
        }
    }, []);

    // persist
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (_) {
        }
    }, [state]);

    const addItem = (item: Omit<CartItem, "qty">, qty = 1) =>
        dispatch({
            type: "ADD_ITEM",
            payload: {...item, qty: Math.max(1, qty)},
        });

    const removeItem = (id: string) => dispatch({type: "REMOVE_ITEM", payload: {id}});

    const setQty = (id: string, qty: number) => dispatch({type: "SET_QTY", payload: {id, qty}});

    const clear = () => dispatch({type: "CLEAR"});

    const totalItems = state.items.reduce((s, it) => s + it.qty, 0);

    return (
        <CartContext.Provider value={{state, addItem, removeItem, setQty, clear, totalItems}}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
