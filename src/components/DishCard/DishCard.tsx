// File: `src/components/DishCard/DishCard.tsx`
/**
 * DishCard
 *
 * Small presentational component that shows a dish preview card or a skeleton
 * placeholder while data is loading.
 *
 * Props:
 * - `dish` (optional): Dish data to render. If omitted and `skeleton` is false,
 *   the component returns null.
 * - `skeleton` (default: false): When true renders non-interactive skeleton UI.
 * - `orderLink` (default: '/menu'): Destination for the "order" CTA link.
 */
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { bufferLikeToDataUrl } from '../../utils/image';
import type { Dish } from '../../api/dishes';
import './DishCard.scss';

type Props = {
    dish?: Dish;
    skeleton?: boolean;
    orderLink?: string;
};

export default function DishCard({ dish, skeleton = false, orderLink = '/menu' }: Props) {
    // Render skeleton placeholder for loading state. Marked aria-hidden.
    if (skeleton) {
        return (
            <div className="dish-card dish-card--skeleton" aria-hidden="true">
                <div className="dish-card__image dish-card__image--skeleton" />
                <div className="dish-card__order dish-card__order--skeleton" />
                <h3 className="dish-card__name dish-card__name--skeleton skeleton-line skeleton-line--short" />
                <p className="dish-card__description dish-card__description--skeleton skeleton-line skeleton-line--long" />
                <p className="dish-card__price dish-card__price--skeleton skeleton-line skeleton-line--small" />
            </div>
        );
    }

    // If no dish provided and not rendering skeleton, render nothing.
    if (!dish) return null;

    // Convert possible buffer-like image to a data URL, fallback to placeholder.
    const src = bufferLikeToDataUrl(dish.image) ?? '/images/placeholder.png';

    return (
        <div className="dish-card">
            {/* Dish image with accessible alt text */}
            <img
                src={src}
                alt={dish.name}
                className="dish-card__image"
            />

            {/* Order CTA; uses provided orderLink so the card can be reused */}
            <Link to={orderLink} className="dish-card__order dish-card__order--active">
                Beställ nu <ArrowRight />
            </Link>

            {/* Dish title */}
            <h3 className="dish-card__name">{dish.name}</h3>

            {/* Optional description — only render when present */}
            {dish.description && <p className="dish-card__description">{dish.description}</p>}

            {/* Price; simple rendering assuming price field holds displayable number */}
            <p className="dish-card__price">{dish.price} kr</p>
        </div>
    );
}
