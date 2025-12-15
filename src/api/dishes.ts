// File: `src/api/dishes.ts`
import { api } from './client';

/**
 * Represents a single dish item returned from the API.
 *
 * - `id` is required and used as the unique identifier.
 * - Other fields are optional because some API responses may omit them.
 */
export type Dish = {
    id: string;
    name: string; // human-friendly name shown in the UI
    description?: string; // optional longer text describing the dish
    price?: number; // optional price in the smallest currency unit or float
    image?: string; // optional URL or path to the dish image
};

/**
 * Fetch the menu (list of dishes) from the API.
 *
 * Uses the shared `api` client wrapper which throws on non-2xx responses
 * and returns parsed JSON (or `null` for empty bodies).
 *
 * @returns Promise resolving to an array of `Dish` objects.
 * @throws Errors from the `api` client when the network or response fails.
 */
export async function getMenu(): Promise<Dish[]> {
    // Delegate to the central api client which handles headers, credentials and JSON parsing.
    return api.get<Dish[]>('/menu');
}
