// File: `src/pages/HomePage/Home.tsx`
import Navbar from '../../components/navbar';
import SmallCard from '../../components/SmallCard/SmallCard';
import './home.scss';
import { Clock, Sparkles, MapPin } from 'lucide-react';
import useMenu from '../../hooks/useMenu';
import DishCard from '../../components/DishCard/DishCard';
import Footer from '../../components/footer/Footer.tsx';
import { Link } from 'react-router-dom';

export default function HomePage() {
    const { dishes, loading, error } = useMenu(3);

    const skeletonCount = 3;

    return (
        <>
            <Navbar active="home" />

            <section className="hero">
                <h1 className="hero__title">
                    Smaken av Asien, <span className="hero__title--gradient">på din tid</span>
                </h1>
                <p className="hero__text">
                    Upptäck vårt spännande sortiment av asiatiska fusion-rätter. Beställ online
                    och hämta snabbt – perfekt för dig som är på språng!
                </p>

                <div className="hero__cards">
                    <SmallCard icon={<Clock size={35} />} title="Snabb hämtning" text="Beställ online och hämta inom 15-20 minuter" />
                    <SmallCard icon={<Sparkles size={35} />} title="Färska ingredienser" text="Vi använder bara de bästa råvarorna varje dag" />
                    <SmallCard icon={<MapPin size={35} />} title="Perfekt läge" text="Centralt beläget mitt i staden" />
                </div>
            </section>

            <section className="popular-dishes">
                <h2 className="popular-dishes__title">Våra populäraste val</h2>
                <p className="popular-dishes__text">Smakfulla favoriter som våra kunder älskar</p>

                {loading && <p className="popular-dishes__loading">Laddar rätter...</p>}
                {error && <p className="popular-dishes__error">{error}</p>}

                <div className="popular-dishes__list">
                    {loading
                        ? Array.from({ length: skeletonCount }).map((_, i) => <DishCard key={`skeleton-${i}`} skeleton />)
                        : dishes.map((dish) => <DishCard key={dish.id} dish={dish} />)}
                </div>

                <button className="popular-dishes__button">
                    <Link to="/menu" className="popular-dishes__button-link">Se hela menyn</Link>
                </button>
            </section>

            <Footer />
        </>
    );
}
