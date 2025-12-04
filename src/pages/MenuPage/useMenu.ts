// File: `src/pages/MenuPage/useMenu.ts`
import { useEffect, useRef, useState } from "react";
import type { Dish } from "../../api/dishes";
import { getMenu } from "../../api/dishes";
import { useCart } from "../../context/CartContext";
import { bufferLikeToDataUrl } from "../../utils/image";

const filters = ["Alla", "Huvudrätter", "Tillbehör", "Drycker", "Desserter"];

const normalize = (s: string) =>
    (s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function useMenu() {
    const [activeFilter, setActiveFilter] = useState<string>(filters[0]);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { addItem } = useCart();

    // quantity map keyed by dish id (stringified)
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    // transient map for items that were just added — used to show "Tillagd!" for 3s
    const [recentlyAdded, setRecentlyAdded] = useState<Record<string, boolean>>({});
    const timersRef = useRef<Record<string, number>>({});

    useEffect(() => {
        let cancelled = false;

        (async function loadDishes() {
            setLoading(true);
            setError(null);
            try {
                const data = await getMenu();

                let items: Dish[] = [];

                if (Array.isArray(data)) {
                    items = data as Dish[];
                } else if (data && Array.isArray((data as any).categories)) {
                    items = (data as any).categories.flatMap((cat: any) =>
                        Array.isArray(cat.items)
                            ? cat.items.map((it: any) => ({ ...it, category: cat.name })) as Dish[]
                            : []
                    );
                } else {
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

    // clear pending timers on unmount
    useEffect(() => {
        return () => {
            Object.values(timersRef.current).forEach((id) => window.clearTimeout(id));
            timersRef.current = {};
        };
    }, []);

    const onFilterClick = (filter: string) => {
        setActiveFilter(filter);
    };

    const filteredDishes = dishes.filter((d) => {
        if (activeFilter === "Alla") return true;
        const cat = (d as any).category ?? (d as any).type ?? "";
        return normalize(String(cat)) === normalize(activeFilter);
    });

    const incQty = (id: string | number) => {
        const key = String(id);
        setQuantities((prev) => ({ ...prev, [key]: (prev[key] || 1) + 1 }));
    };

    const decQty = (id: string | number) => {
        const key = String(id);
        setQuantities((prev) => ({ ...prev, [key]: Math.max(1, (prev[key] || 1) - 1) }));
    };

    const handleAdd = (dish: Dish, qty: number) => {
        const key = String(dish.id);

        // call cart add
        addItem(
            {
                id: key,
                name: dish.name,
                price: typeof dish.price === "number" ? dish.price : undefined,
                image: bufferLikeToDataUrl(dish.image) ?? undefined,
            },
            qty
        );

        // clear existing timer if present
        if (timersRef.current[key]) {
            window.clearTimeout(timersRef.current[key]);
        }

        // mark as recently added
        setRecentlyAdded((s) => ({ ...s, [key]: true }));

        // revert after 3 seconds
        timersRef.current[key] = window.setTimeout(() => {
            setRecentlyAdded((s) => {
                const copy = { ...s };
                delete copy[key];
                return copy;
            });
            delete timersRef.current[key];
        }, 3000);
    };

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
