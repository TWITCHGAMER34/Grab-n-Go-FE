// File: `src/pages/MenuPage/useMenu.ts`
/**
 * useMenu
 *
 * Custom hook for the Menu page:
 * - Loads menu data from the API and supports two common response shapes.
 * - Maintains UI state: active filter, quantities per dish, recently added indicators and loading/error.
 * - Integrates with the cart via `addItem`.
 * - Uses timers to show a transient "recently added" state for 3s per item.
 */
import { useEffect, useRef, useState } from "react";
import type { Dish } from "../../api/dishes";
import { getMenu } from "../../api/dishes";
import { useCart } from "../../context/CartContext";
import { bufferLikeToDataUrl } from "../../utils/image";

// Available filters shown in the UI
const filters = ["Alla", "Huvudrätter", "Tillbehör", "Drycker", "Desserter"];

// Normalize strings for case- and diacritic-insensitive comparisons
const normalize = (s: string) =>
    (s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * Hook implementation
 *
 * Returns menu-related state and actions used by the Menu page.
 */
export default function useMenu() {
    // Currently selected filter
    const [activeFilter, setActiveFilter] = useState<string>(filters[0]);
    // Loaded dishes from the API
    const [dishes, setDishes] = useState<Dish[]>([]);
    // Loading / error UI state
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Cart action to add items
    const { addItem } = useCart();

    // Quantity map keyed by dish id (string) for per-item quantity controls
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    // Transient map marking items that were just added (used to show a temporary label)
    const [recentlyAdded, setRecentlyAdded] = useState<Record<string, boolean>>({});
    // Ref storing active timer ids so they can be cleared on unmount or when re-adding
    const timersRef = useRef<Record<string, number>>({});

    // Load dishes on mount. Supports two shapes:
    // 1) top-level array of Dish
    // 2) object with categories array, each containing items
    useEffect(() => {
        let cancelled = false;

        (async function loadDishes() {
            setLoading(true);
            setError(null);
            try {
                const data = await getMenu();

                let items: Dish[] = [];

                if (Array.isArray(data)) {
                    // API returned an array of dishes
                    items = data as Dish[];
                } else if (data && Array.isArray((data as any).categories)) {
                    // API returned categories; flatten items and attach category name
                    items = (data as any).categories.flatMap((cat: any) =>
                        Array.isArray(cat.items)
                            ? cat.items.map((it: any) => ({ ...it, category: cat.name })) as Dish[]
                            : []
                    );
                } else {
                    // Unexpected format — surface a clear error
                    throw new Error("Unexpected API response format for menu");
                }

                if (!cancelled) setDishes(items);
            } catch (err: any) {
                if (!cancelled) setError(err?.message || "Något gick fel vid inläsning av rätter.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // Clear any pending timers when the component using the hook unmounts
    useEffect(() => {
        return () => {
            Object.values(timersRef.current).forEach((id) => window.clearTimeout(id));
            timersRef.current = {};
        };
    }, []);

    // Filter click handler
    const onFilterClick = (filter: string) => {
        setActiveFilter(filter);
    };

    // Apply active filter to the list of dishes
    const filteredDishes = dishes.filter((d) => {
        if (activeFilter === "Alla") return true;
        const cat = (d as any).category ?? (d as any).type ?? "";
        return normalize(String(cat)) === normalize(activeFilter);
    });

    // Increase per-item quantity (default base is 1)
    const incQty = (id: string | number) => {
        const key = String(id);
        setQuantities((prev) => ({ ...prev, [key]: (prev[key] || 1) + 1 }));
    };

    // Decrease per-item quantity but never go below 1
    const decQty = (id: string | number) => {
        const key = String(id);
        setQuantities((prev) => ({ ...prev, [key]: Math.max(1, (prev[key] || 1) - 1) }));
    };

    // Add a dish to the cart and mark it as recently added for 3 seconds
    const handleAdd = (dish: Dish, qty: number) => {
        const key = String(dish.id);

        // Convert image buffer-like to data URL for cart preview
        addItem(
            {
                id: key,
                name: dish.name,
                price: typeof dish.price === "number" ? dish.price : undefined,
                image: bufferLikeToDataUrl(dish.image) ?? undefined,
            },
            qty
        );

        // If a timer exists for this key, clear it so the new 3s period restarts
        if (timersRef.current[key]) {
            window.clearTimeout(timersRef.current[key]);
        }

        // Mark item as recently added to toggle UI label
        setRecentlyAdded((s) => ({ ...s, [key]: true }));

        // Revert the recently added flag after 3 seconds
        timersRef.current[key] = window.setTimeout(() => {
            setRecentlyAdded((s) => {
                const copy = { ...s };
                delete copy[key];
                return copy;
            });
            delete timersRef.current[key];
        }, 3000);
    };

    // If no dishes yet, show a fixed number of skeletons; otherwise match dishes count
    const skeletonCount = dishes.length > 0 ? dishes.length : 8;

    return {
        filters,
        activeFilter,
        setActiveFilter: onFilterClick,
        dishes: filteredDishes,
        loading,
        error,
        quantities,
        incQty,
        decQty,
        recentlyAdded,
        handleAdd,
        skeletonCount,
    };
}
