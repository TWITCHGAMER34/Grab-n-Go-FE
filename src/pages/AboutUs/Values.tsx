// File: `src/pages/AboutUs/Values.tsx`
import SmallCard from "../../components/SmallCard/SmallCard";
import { Heart, Leaf, Award } from "lucide-react";
import "./about.scss";

export default function Values() {
    return (
        <section className="about-us__values">
            <h2 className="about-us__values__title">Våra värderingar</h2>
            <div className="about-us__values__cards">
                <SmallCard
                    icon={<Heart size={35} />}
                    title="Passion för mat"
                    text="Vi älskar det vi gör och det syns i varje rätt"
                />
                <SmallCard
                    icon={<Leaf size={35} />}
                    title="Färska ingredienser"
                    text="Endast de bästa råvarorna från lokala leverantörer"
                />
                <SmallCard
                    icon={<Award size={35} />}
                    title="Kvalitet först"
                    text="Vi kompromissar aldrig på kvalitet eller smak"
                />
            </div>
        </section>
    );
}
