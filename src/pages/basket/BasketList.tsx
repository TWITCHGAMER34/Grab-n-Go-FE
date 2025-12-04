// File: `src/pages/basket/BasketList.tsx`
import BasketItem from './BasketItem';

type Item = any;

export default function BasketList({
                                       items,
                                       loading,
                                       onQtyChange,
                                       onRemove,
                                   }: {
    items: Item[];
    loading: boolean;
    onQtyChange: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
}) {
    return (
        <>
            {items.map((it) => (
                <article className="basket__cart-item" key={it.id}>
                    <BasketItem
                        item={it}
                        loading={loading}
                        onQtyChange={(qty: number) => onQtyChange(it.id, qty)}
                        onRemove={() => onRemove(it.id)}
                    />
                </article>
            ))}
        </>
    );
}