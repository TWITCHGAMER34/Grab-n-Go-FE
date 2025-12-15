// File: `src/hooks/useNavActive.ts`
import type { NavKey } from '../types/navigation';

/**
 * useNavActive
 *
 * Return a helper that decides whether a navigation item should be styled as active.
 * When `active` is provided it overrides the router state and only that key is active.
 *
 * @param active - optional NavKey to force a specific item active
 * @returns (key, isActiveFromNavLink) => boolean
 */
export default function useNavActive(active?: NavKey) {
    // The returned function is intended for usage in NavLink's className callback.
    // It prefers the explicit `active` override when present; otherwise it uses
    // the boolean provided by react-router (`isActiveFromNavLink`).
    return (key: NavKey, isActiveFromNavLink: boolean) =>
        active ? active === key : isActiveFromNavLink;
}
