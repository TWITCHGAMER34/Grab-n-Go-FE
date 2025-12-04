// File: `src/pages/MenuPage/MenuItem.tsx`
import type { Dish } from "../../api/dishes";
import { ShoppingCart } from "lucide-react";
import { bufferLikeToDataUrl } from "../../utils/image";

type Props = {
    dish: Dish;
    qty: number;
    justAdded: boolean;
    incQty: (id: string | number) => void;
    decQty: (id: string | number) => void;
    onAdd: (dish: Dish, qty: number) => void;
};

export default function MenuItem({
                                     dish,
                                     qty,
                                     justAdded,
                                     incQty,
                                     decQty,
                                     onAdd,
                                 }: Props) {
    return (
        <li className="menu__item">
            <article>
                <img
                    src={bufferLikeToDataUrl(dish.image) ?? "/images/placeholder.png"}
                    alt={dish.name}
                    className="menu__item__image"
                />
                <div className="menu__item__header">
                    <h3 className="menu__item__title">
                        #{dish.id} - {dish.name}
                    </h3>
                    {dish.price != null && (
                        <p className="menu__item__price">{dish.price} kr</p>
                    )}
                </div>
                {dish.description && (
                    <p className="menu__item__desc">{dish.description}</p>
                )}

                <div className="menu__item__controls">
                    <div
                        className="menu__item__qty"
                        role="group"
                        aria-label={`Quantity for ${dish.name}`}
                    >
                        <button
                            type="button"
                            className="menu__item__qty-btn"
                            onClick={() => decQty(dish.id)}
                            aria-label={`Decrease quantity for ${dish.name}`}
                        >
                            −
                        </button>

                        <div className="menu__item__qty-value" aria-live="polite">
                            {qty}
                        </div>

                        <button
                            type="button"
                            className="menu__item__qty-btn"
                            onClick={() => incQty(dish.id)}
                            aria-label={`Increase quantity for ${dish.name}`}
                        >
                            +
                        </button>
                    </div>

                    <button
                        type="button"
                        className={`menu__item__add-button ${
                            justAdded ? "menu__item__add-button--is-added" : ""
                        }`}
                        onClick={() => onAdd(dish, qty)}
                        aria-label={
                            justAdded
                                ? `Produkt tillagd: ${dish.name}`
                                : `Add ${qty} ${dish.name} to cart`
                        }
                    >
            <span className="menu__item__add-button-icon">
              <ShoppingCart size={17} />
            </span>
                        {justAdded ? "Tillagd!" : "Lägg till"}
                    </button>
                </div>
            </article>
        </li>
    );
}
