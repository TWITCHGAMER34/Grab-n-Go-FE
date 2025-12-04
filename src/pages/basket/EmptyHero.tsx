// File: `src/pages/basket/EmptyHero.tsx`
import { ShoppingCart } from 'lucide-react';

export default function EmptyHero({ onGotoMenu }: { onGotoMenu: () => void }) {
    return (
        <div className="basket__empty-hero">
            <ShoppingCart size={60} className="basket__empty-illustration"/>
            <h2 className="basket__empty-title">Din varukorg är tom</h2>
            <p className="basket__empty-sub">Lägg till några läckra rätter från vår meny</p>
            <button type="button" className="basket__cta-btn" onClick={onGotoMenu}>Gå till menyn</button>
        </div>
    );
}
