// File: `src/hooks/useMenu.ts`
import { useEffect, useState } from 'react';
import { getMenu } from '../api/dishes';
import type { Dish } from '../api/dishes';

function pickRandom<T>(arr: T[], count: number): T[] {
    const n = Math.min(count, arr.length);
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0 && copy.length - 1 - i < n; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
}

export default function useMenu(count = 3) {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await getMenu();

                let items: Dish[] = [];

                if (Array.isArray(data)) {
                    items = data as Dish[];
                } else if (data && Array.isArray((data as any).categories)) {
                    items = (data as any).categories.flatMap((cat: any) =>
                        Array.isArray(cat.items) ? (cat.items as Dish[]) : []
                    );
                } else {
                    throw new Error('Unexpected API response format for menu');
                }

                const selection = pickRandom(items, count);
                if (!cancelled) setDishes(selection);
            } catch (err: any) {
                if (!cancelled) setError(err?.message ?? 'Failed to load menu');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [count]);

    return { dishes, loading, error };
}
