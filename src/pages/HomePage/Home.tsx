// `src/pages/HomePage/Home.tsx`
import Navbar from '../../components/navbar/NavBar';
import SmallCard from '../../components/SmallCard/SmallCard';
import './home.scss';
import {Clock, Sparkles, MapPin} from 'lucide-react';
import {useState, useEffect} from 'react';
import {getMenu} from '../../api/dishes';
import type {Dish} from '../../api/dishes';
import {bufferLikeToDataUrl} from '../../utils/image';
import Footer from "../../components/footer/Footer.tsx";
import {Link} from "react-router-dom";

export default function HomePage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dishes, setDishes] = useState<Dish[]>([]);

    function pickRandom<T>(arr: T[], count: number): T[] {
        const n = Math.min(count, arr.length);
        const copy = arr.slice();
        // Fisher-Yates shuffle, only until we have first n elements randomized
        for (let i = copy.length - 1; i > 0 && copy.length - 1 - i < n; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy.slice(0, n);
    }

    useEffect(() => {
        let cancelled = false;

        (async function loadDishes() {
            setLoading(true);
            setError(null);
            try {
                const data = await getMenu();
                console.log(data);

                // normalize to Dish[]
                let items: Dish[] = [];

                if (Array.isArray(data)) {
                    // API returned an array of dishes directly
                    items = data as Dish[];
                } else if (data && Array.isArray((data as any).categories)) {
                    // API returned { categories: [{ items: [...] }, ...] }
                    items = (data as any).categories.flatMap((cat: any) =>
                        Array.isArray(cat.items) ? cat.items as Dish[] : []
                    );
                } else {
                    throw new Error('Unexpected API response format for menu');
                }

                const selection = pickRandom(items, 3);

                if (!cancelled) setDishes(selection);
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Något gick fel vid inläsning av rätter.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            <Navbar active="home"/>

            <section className={"hero"}>
                <h1 className={"hero__title"}>
                    Smaken av Asien, <span className={"hero__title--gradient"}>på din tid</span>
                </h1>
                <p className={"hero__text"}>
                    Upptäck vårt spännande sortiment av asiatiska fusion-rätter. Beställ online
                    och hämta snabbt – perfekt för dig som är på språng!
                </p>
                <div className="card__container">
                    <SmallCard icon={<Clock size={35}/>} title="Snabb hämtning"
                               text="Beställ online och hämta inom 15-20 minuter"/>
                    <SmallCard icon={<Sparkles size={35}/>} title="Färska ingredienser"
                               text="Vi använder bara de bästa råvarorna varje dag"/>
                    <SmallCard icon={<MapPin size={35}/>} title="Perfekt läge" text="Centralt beläget mitt i staden"/>
                </div>
            </section>

            <section className={"popular-dishes"}>
                <h2 className={"popular-dishes__title"}>Våra populäraste val</h2>
                <p className={"popular-dishes__text"}>Smakfulla favoriter som våra kunder älskar</p>

                {loading && <p>Laddar rätter...</p>}
                {error && <p className="error">{error}</p>}

                <div className="dishes__container">
                    {dishes.map((dish) => (
                        <div key={dish.id} className="dish-card">
                            <img
                                src={bufferLikeToDataUrl(dish.image) ?? '/images/placeholder.png'}
                                alt={dish.name}
                                className="dish-card__image"
                            />
                            <h3 className="dish-card__name">{dish.name}</h3>
                            <p className="dish-card__description">{dish.description}</p>
                            <p className="dish-card__price">{dish.price} kr</p>
                        </div>
                    ))}
                </div>
                <button className="popular__dishes-button"><Link to={"/menu"} className={"popular__dishes-button-text"}>Se hela menyn</Link></button>
            </section>

            <Footer />
        </>
    );
}
