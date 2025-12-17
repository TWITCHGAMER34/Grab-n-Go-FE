// file: src/components/navbar/HamburgerItems.tsx
import type { MouseEvent } from "react";

type NavItem = {
    id: string;
    label: string;
    href?: string;
    onClick?: () => void;
};

type Props = {
    navItems: NavItem[];
    onNavigate?: () => void;
};

export default function HamburgerItems({ navItems, onNavigate }: Props) {
    return (
        <ul className="hamburger-items" role="menu">
            {navItems.map((item) => (
                <li key={item.id} role="none">
                    <a
                        role="menuitem"
                        href={item.href ?? "#"}
                        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                            if (item.onClick) {
                                e.preventDefault();
                                item.onClick();
                            }
                            if (onNavigate) onNavigate();
                        }}
                        className="hamburger-link"
                    >
                        {item.label}
                    </a>
                </li>
            ))}
        </ul>
    );
}
