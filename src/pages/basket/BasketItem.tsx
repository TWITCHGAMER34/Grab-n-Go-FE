// File: `src/pages/basket/BasketItem.tsx`
import {Trash2} from "lucide-react";

export default function BasketItem({
                                       item,
                                       loading,
                                       onQtyChange,
                                       onRemove,
                                   }: {
    item: any;
    loading: boolean;
    onQtyChange: (qty: number) => void;
    onRemove: () => void;
}) {
    return (
        <>
            <div className="basket__item-left">
                {item.image && <img src={item.image} alt={item.name} className="basket__item-image"/>}
                <div className="basket__item-meta">
                    <div className="basket__item-name">{item.name}</div>
                    <div className="basket__item-price">{(item.price ?? 0).toFixed(0)} kr / st</div>
                </div>
            </div>

            <div className="basket__item-right">
                <div className="basket__qty-controls" aria-label={`Quantity for ${item.name}`}>
                    <button type="button" onClick={() => onQtyChange(Math.max(1, item.qty - 1))} disabled={loading}>−
                    </button>
                    <input type="number" min={1} value={item.qty}
                           onChange={(e) => onQtyChange(Math.max(1, Number(e.target.value || 1)))}/>
                    <button type="button" onClick={() => onQtyChange(item.qty + 1)} disabled={loading}>+</button>
                </div>

                <div className="basket__item-subtotal">{((item.price ?? 0) * item.qty).toFixed(0)} kr</div>
                <button className="basket__remove" aria-label="Remove" onClick={onRemove} disabled={loading}><Trash2/></button>
            </div>
        </>
    );
}