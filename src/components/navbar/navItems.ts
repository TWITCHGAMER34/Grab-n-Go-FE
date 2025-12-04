// File: `src/components/navbar/navItems.ts`
import type { NavKey } from '../../types/navigation';

export const navItems: { key: NavKey; to: string; label: string }[] = [
    { key: 'home', to: '/', label: 'Hem' },
    { key: 'menu', to: '/menu', label: 'Meny' },
    { key: 'orders', to: '/orders', label: 'Mina Beställningar' },
    { key: 'about', to: '/about', label: 'Om oss' },
];

export default navItems;
