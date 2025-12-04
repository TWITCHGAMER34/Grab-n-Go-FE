// File: `src/pages/MenuPage/Menu.tsx`
import {useEffect, useRef, useState} from "react";
import type {ReactNode} from "react";
import {getMenu, type Dish} from "../../api/dishes";
import Navbar from "../../components/navbar/NavBar.tsx";
import Footer from "../../components/footer/Footer.tsx";
import {bufferLikeToDataUrl} from "../../utils/image.ts";
import "./menu.scss";
import {ShoppingCart} from "lucide-react";
import {useCart} from "../../context/CartContext.tsx";

const filters = ["Alla", "Huvudrätter", "Tillbehör", "Drycker", "Desserter"];

const normalize = (s: string) =>
    (s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function MenuPage() {
    const [activeFilter, setActiveFilter] = useState<string>(filters[0]);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const {addItem, state} = useCart();

    // quantity map keyed by dish id (stringified)
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    // transient map for items that were just added — used to show "Tillagd!" for 3s
    const [recentlyAdded, setRecentlyAdded] = useState<Record<string, boolean>>({});
    const timersRef = useRef<Record<string, number>>({});

    useEffect(() => {
        let cancelled = false;

        (async function loadDishes() {
            setLoading(true);
            setError(null);
            try {
                const data = await getMenu();

                let items: Dish[] = [];

                if (Array.isArray(data)) {
                    items = data as Dish[];
                } else if (data && Array.isArray((data as any).categories)) {
                    items = (data as any).categories.flatMap((cat: any) =>
                        Array.isArray(cat.items)
                            ? cat.items.map((it: any) => ({...it, category: cat.name})) as Dish[]
                            : []
                    );
                } else {
                    throw new Error("Unexpected API response format for menu");
                }

                if (!cancelled) setDishes(items);
            } catch (err: any) {
                if (!cancelled) setError(err.message || "Något gick fel vid inläsning av rätter.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // clear pending timers on unmount
    useEffect(() => {
        return () => {
            Object.values(timersRef.current).forEach((id) => window.clearTimeout(id));
            timersRef.current = {};
        };
    }, []);

    const onFilterClick = (filter: string) => {
        setActiveFilter(filter);
    };

    const filteredDishes = dishes.filter((d) => {
        if (activeFilter === "Alla") return true;
        const cat = (d as any).category ?? (d as any).type ?? "";
        return normalize(String(cat)) === normalize(activeFilter);
    });

    const incQty = (id: string | number) => {
        const key = String(id);
        setQuantities((prev) => ({...prev, [key]: (prev[key] || 1) + 1}));
    };

    const decQty = (id: string | number) => {
        const key = String(id);
        setQuantities((prev) => ({...prev, [key]: Math.max(1, (prev[key] || 1) - 1)}));
    };

    // derive set of ids currently in cart for quick lookup
    const cartIds = new Set((state?.items ?? []).map((i) => String(i.id)));

    const handleAdd = (dish: Dish, qty: number) => {
        const key = String(dish.id);

        // call cart add
        addItem(
            {
                id: key,
                name: dish.name,
                price: typeof dish.price === "number" ? dish.price : undefined,
                image: bufferLikeToDataUrl(dish.image) ?? undefined,
            },
            qty
        );

        // clear existing timer if present
        if (timersRef.current[key]) {
            window.clearTimeout(timersRef.current[key]);
        }

        // mark as recently added
        setRecentlyAdded((s) => ({...s, [key]: true}));

        // revert after 3 seconds
        const t = window.setTimeout(() => {
            setRecentlyAdded((s) => {
                const copy = {...s};
                delete copy[key];
                return copy;
            });
            delete timersRef.current[key];
        }, 3000);

        timersRef.current[key] = t;
    };

    // show a skeleton per available dish when we have a prefetched list,
    // otherwise fall back to a sensible default (8)
    const skeletonCount = dishes.length > 0 ? dishes.length : 8;
    const skeletons: ReactNode[] = Array.from({length: skeletonCount}, (_, i) => (
        <li key={`skeleton-${i}`} className="menu__item skeleton" aria-hidden="true">
            <article>
                <div className="menu__item-image skeleton-image"/>
                <div className="menu__item-header">
                    <h3 className="menu__item-title skeleton-line skeleton-line--short"/>
                    <p className="menu__item-price skeleton-line skeleton-line--price"/>
                </div>
                <p className="menu__item-desc skeleton-line skeleton-line--long"/>
                <div className="menu__item-controls">
                    <div className="menu__qty" role="group" aria-hidden="true">
                        <button type="button" className="menu__qty-btn skeleton-btn" aria-hidden="true">−</button>
                        <div className="menu__qty-value skeleton-line skeleton-line--small"/>
                        <button type="button" className="menu__qty-btn skeleton-btn" aria-hidden="true">+</button>
                    </div>
                    <div className="menu__item-add-button skeleton-button" aria-hidden="true"/>
                </div>
            </article>
        </li>
    ));

    return (
        <>
            <Navbar active="menu"/>

            <section className="menu">
                <div className="menu__header">
                    <h1 className="menu__title">Vår meny</h1>
                    <p className="menu__text">Upptäck våra spännande asiatiska fusion-rätter</p>

                    <ul className="menu__filters" role="list">
                        {filters.map((f) => (
                            <li key={f} className="menu__filter">
                                <button
                                    type="button"
                                    className={`menu__filter-btn ${activeFilter === f ? "is-active" : ""}`}
                                    onClick={() => onFilterClick(f)}
                                    aria-pressed={activeFilter === f}
                                >
                                    {f}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="menu__list">
                    {loading && <p className="loading">Loading menu…</p>}
                    {error && <p className="error">{error}</p>}
                    {!loading && !error && filteredDishes.length === 0 && <p>No dishes for the selected filter.</p>}

                    <ul className="menu__items" role="list">
                        {loading ? (
                            skeletons
                        ) : (
                            filteredDishes.map((dish) => {
                                const key = String(dish.id);
                                const qty = quantities[key] ?? 1;
                                const justAdded = Boolean(recentlyAdded[key]);
                                return (
                                    <li key={dish.id} className="menu__item">
                                        <article>
                                            <img
                                                src={bufferLikeToDataUrl(dish.image) ?? "/images/placeholder.png"}
                                                alt={dish.name}
                                                className="menu__item-image"
                                            />
                                            <div className="menu__item-header">
                                                <h3 className="menu__item-title">#{dish.id} - {dish.name}</h3>
                                                {dish.price != null &&
                                                    <p className="menu__item-price">{dish.price} kr</p>}
                                            </div>
                                            {dish.description && <p className="menu__item-desc">{dish.description}</p>}

                                            <div className="menu__item-controls">
                                                <div className="menu__qty" role="group"
                                                     aria-label={`Quantity for ${dish.name}`}>
                                                    <button
                                                        type="button"
                                                        className="menu__qty-btn"
                                                        onClick={() => decQty(dish.id)}
                                                        aria-label={`Decrease quantity for ${dish.name}`}
                                                    >
                                                        −
                                                    </button>

                                                    <div className="menu__qty-value" aria-live="polite">{qty}</div>

                                                    <button
                                                        type="button"
                                                        className="menu__qty-btn"
                                                        onClick={() => incQty(dish.id)}
                                                        aria-label={`Increase quantity for ${dish.name}`}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    className={`menu__item-add-button ${justAdded ? "is-added" : ""}`}
                                                    onClick={() => handleAdd(dish, qty)}
                                                    aria-label={justAdded ? `Produkt tillagd: ${dish.name}` : `Add ${qty} ${dish.name} to cart`}
                                                >
                          <span className="menu__item-add-button-icon">
                            <ShoppingCart size={17}/>
                          </span>
                                                    {justAdded ? "Tillagd!" : "Lägg till"}
                                                </button>
                                            </div>
                                        </article>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            </section>

            <Footer/>
        </>
    );
}
