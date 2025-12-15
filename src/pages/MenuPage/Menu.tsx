// File: src/pages/MenuPage/Menu.tsx
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer/Footer";
import useMenu from "./useMenu";
import MenuItem from "./MenuItem";
import "./menu.scss";
import Seo from "../../components/Seo.tsx";

export default function MenuPage() {
    const {
        filters,
        activeFilter,
        setActiveFilter,
        dishes,
        loading,
        error,
        quantities,
        incQty,
        decQty,
        recentlyAdded,
        handleAdd,
        skeletonCount,
    } = useMenu();

    const [cardsLoaded, setCardsLoaded] = useState(false);

    useEffect(() => {
        if (!loading) {
            const t = setTimeout(() => setCardsLoaded(true), 50);
            return () => clearTimeout(t);
        }
        setCardsLoaded(false);
    }, [loading]);

    const skeletons: ReactNode[] = Array.from({ length: skeletonCount }, (_, i) => (
        <li
            key={`skeleton-${i}`}
            className="menu__item menu__item--skeleton"
            aria-hidden="true"
        >
            <article>
                <div className="menu__skeleton-image" />
                <div className="menu__item__header">
                    <h3 className="menu__item__title menu__skeleton-line menu__skeleton-line--short" />
                    <p className="menu__item__price menu__skeleton-line menu__skeleton-line--price" />
                </div>
                <p className="menu__item__desc menu__skeleton-line menu__skeleton-line--long" />
                <div className="menu__item__controls">
                    <div className="menu__item__qty" role="group" aria-hidden="true">
                        <button
                            type="button"
                            className="menu__item__qty-btn menu__skeleton-btn"
                            aria-hidden="true"
                        >
                            −
                        </button>
                        <div className="menu__item__qty-value menu__skeleton-line menu__skeleton-line--small" />
                        <button
                            type="button"
                            className="menu__item__qty-btn menu__skeleton-btn"
                            aria-hidden="true"
                        >
                            +
                        </button>
                    </div>
                    <div className="menu__skeleton-button" aria-hidden="true" />
                </div>
            </article>
        </li>
    ));

    return (
        <>
            <Seo title="Menu" description="Our menu" />
            <Navbar active="menu" />

            <section className="menu">
                <div className="menu__header">
                    <h1 className="menu__title">Vår meny</h1>
                    <p className="menu__text">
                        Upptäck våra spännande asiatiska fusion-rätter
                    </p>

                    <ul className="menu__filters" role="list">
                        {filters.map((f) => (
                            <li key={f} className="menu__filter">
                                <button
                                    type="button"
                                    className={`menu__filter-btn ${
                                        activeFilter === f ? "is-active" : ""
                                    }`}
                                    onClick={() => setActiveFilter(f)}
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
                    {!loading && !error && dishes.length === 0 && (
                        <p>No dishes for the selected filter.</p>
                    )}

                    <ul className={`menu__items ${cardsLoaded ? "is-loaded" : ""}`} role="list">
                        {loading
                            ? skeletons
                            : dishes.map((dish) => {
                                const key = String(dish.id);
                                const qty = quantities[key] ?? 1;
                                const justAdded = Boolean(recentlyAdded[key]);
                                return (
                                    <MenuItem
                                        key={dish.id}
                                        dish={dish}
                                        qty={qty}
                                        justAdded={justAdded}
                                        incQty={incQty}
                                        decQty={decQty}
                                        onAdd={handleAdd}
                                    />
                                );
                            })}
                    </ul>
                </div>
            </section>

            <Footer />
        </>
    );
}
