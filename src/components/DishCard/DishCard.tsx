// File: `src/components/DishCard/DishCard.tsx`
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

    if (!dish) return null;

    return (
        <div className="dish-card">
            <img
                src={bufferLikeToDataUrl(dish.image) ?? '/images/placeholder.png'}
                alt={dish.name}
                className="dish-card__image"
            />
            <Link to={orderLink} className="dish-card__order dish-card__order--active">
                Beställ nu <ArrowRight />
            </Link>
            <h3 className="dish-card__name">{dish.name}</h3>
            {dish.description && <p className="dish-card__description">{dish.description}</p>}
            <p className="dish-card__price">{dish.price} kr</p>
        </div>
    );
}
