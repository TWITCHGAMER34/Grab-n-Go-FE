// File: `src/pages/AboutUs/Hero.tsx`
import "./about.scss";

export default function Hero() {
    return (
        <section className="about-us__hero">
            <div className="about-us__hero__wrapper">
                <h1 className="about-us__hero__title">Om Grab ‘n’ Go</h1>
                <p className="about-us__hero__text">
                    Vi är mer än bara en take away-resturang. Vi är din snabba väg till
                    autentisk asiatisk fusion-mat av högsta kvalitet.
                </p>
            </div>

            <div className="about-us__hero__info">
                <div className="about-us__hero__info__wrapper">
                    <h2 className="about-us__hero__info__title">Vår historia</h2>
                    <p className="about-us__hero__info__text">
                        Grab 'n' Go grundades med en enkel vision: att göra extraordinär asiatisk
                        mat tillgänglig för alla, även när tiden är knapp. Vi tror att snabb mat
                        inte behöver betyda kompromisser. Vårt kök kombinerar traditionella asiatiska
                        smaker med moderna tekniker och lokala ingredienser. Varje rätt är noggrant
                        komponerad för att leverera maximalt med smak och fräschör. Med vårt enkla
                        online-beställningssystem kan du njuta av restaurangkvalitet hemma, på
                        kontoret eller var du än är. Beställ, hämta och njut – det är så enkelt det är!
                    </p>
                </div>

                <div className="about-us__hero__info__image__wrapper">
                    <img
                        src="/images/about-us-hero-image.png"
                        alt="About us hero image"
                        className="about-us__hero__info__image"
                    />
                </div>
            </div>
        </section>
    );
}
