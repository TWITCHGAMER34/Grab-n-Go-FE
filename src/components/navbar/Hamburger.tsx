// file: `src/components/navbar/Hamburger.tsx`
import { useEffect, useRef, useState } from "react";
import HamburgerItems from "./HamburgerItems";
import "./hamburger.scss"; // <- use the actual scss filename
import { Menu } from "lucide-react";

type NavItem = { id: string; label: string; href?: string; onClick?: () => void };

export default function Hamburger() {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const navItems: NavItem[] = [
        { id: "home", label: "Home", href: "/" },
        { id: "menu", label: "Menu", href: "/menu" },
        { id: "orders", label: "Orders", href: "/orders" },
        { id: "about", label: "About", href: "/about" },
        { id: "login", label: "Login", href: "/login" },
    ];

    useEffect(() => {
        function handleDown(e: MouseEvent) {
            if (!rootRef.current) return;
            if (open && !rootRef.current.contains(e.target as Node)) setOpen(false);
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", handleDown);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleDown);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    return (
        <div className="hamburger-root" ref={rootRef}>
            <button
                className={`hamburger ${open ? "is-open" : ""}`}
                aria-controls="mobile-menu"
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
            >
                <Menu />
            </button>

            <div
                id="mobile-menu"
                className={`hamburger-panel ${open ? "open" : ""}`}
                role="menu"
                aria-hidden={!open}
            >
                <HamburgerItems
                    navItems={navItems}
                    onNavigate={() => {
                        setOpen(false);
                    }}
                />
            </div>
        </div>
    );
}