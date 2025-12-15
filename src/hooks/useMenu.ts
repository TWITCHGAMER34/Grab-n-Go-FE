// File: `src/hooks/useMenu.ts`
/**
 * useMenu
 *
 * Custom hook to load the application menu and return a random selection of dishes.
 *
 * - Fetches menu data from the API via `getMenu`.
 * - Supports two common response shapes:
 *   1. An array of `Dish` objects.
 *   2. An object with a `categories` array where each category has an `items` array.
 * - Returns a small random selection (default 3) using a partial Fisher-Yates shuffle.
 *
 * @param count - number of random dishes to return (default: 3)
 * @returns { dishes: Dish[], loading: boolean, error: string | null }
 */
import { useEffect, useState } from 'react';
import { getMenu } from '../api/dishes';
import type { Dish } from '../api/dishes';

/**
 * pickRandom
 *
 * Select up to `count` random elements from `arr`.
 * Uses a partial Fisher-Yates shuffle to avoid fully shuffling large arrays.
 *
 * @param arr - source array
 * @param count - requested number of items
 * @returns new array with up to `count` randomly selected items
 */
function pickRandom<T>(arr: T[], count: number): T[] {
    const n = Math.min(count, arr.length);
    const copy = arr.slice();

    // Perform a partial Fisher-Yates: only run enough iterations to
    // bring `n` random items to the end of the array, then slice them off.
    for (let i = copy.length - 1; i > 0 && copy.length - 1 - i < n; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements at indices i and j
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    // Take the last `n` items which were randomized by the loop above.
    return copy.slice(0, n);
}

/**
 * Hook that returns a random subset of dishes from the menu.
 *
 * - `dishes`: array of selected Dish objects
 * - `loading`: true while the request is in-flight
 * - `error`: error message when fetch fails
 */
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

                // Handle two common API shapes:
                // 1) top-level array of dishes
                // 2) object with `categories`, each containing `items`
                if (Array.isArray(data)) {
                    items = data as Dish[];
                } else if (data && Array.isArray((data as any).categories)) {
                    items = (data as any).categories.flatMap((cat: any) =>
                        Array.isArray(cat.items) ? (cat.items as Dish[]) : []
                    );
                } else {
                    // Unexpected format — surface a clear error for debugging
                    throw new Error('Unexpected API response format for menu');
                }

                // Pick a random subset and update state unless the effect was cancelled
                const selection = pickRandom(items, count);
                if (!cancelled) setDishes(selection);
            } catch (err: any) {
                // Only set error when the effect is still active
                if (!cancelled) setError(err?.message ?? 'Failed to load menu');
            } finally {
                // Ensure loading is cleared if not cancelled
                if (!cancelled) setLoading(false);
            }
        })();

        // Cleanup flag to avoid state updates after unmount
        return () => {
            cancelled = true;
        };
    }, [count]);

    return { dishes, loading, error };
}
