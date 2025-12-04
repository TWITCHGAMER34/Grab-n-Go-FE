// File: `src/hooks/useNavActive.ts`
import type { NavKey } from '../types/navigation';

export default function useNavActive(active?: NavKey) {
    return (key: NavKey, isActiveFromNavLink: boolean) =>
        active ? active === key : isActiveFromNavLink;
}
