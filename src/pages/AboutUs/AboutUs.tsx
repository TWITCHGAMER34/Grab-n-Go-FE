import Navbar from "../../components/navbar/NavBar.tsx";
import Footer from "../../components/footer/Footer.tsx";
import "./about.scss";
import SmallCard from "../../components/SmallCard/SmallCard.tsx";
import {Heart, Leaf, Award, MapPin, Clock, Phone, Mail} from "lucide-react";

export default function AboutUs() {
    return (
        <>
            <Navbar active="about"/>

            <section className="about-us">
                <section className="about-us__hero">
                    <div className="about-us__hero__wrapper">
                        <h1 className="about-us__hero__title">Om Grab ‘n’ Go</h1>
                        <p className="about-us__hero__text">Vi är mer än bara en take away-resturang. Vi är din snabba
                            väg till autentisk asiatisk fusion-mat av högsta kvalitet.</p>
                    </div>
                    <div className={"about-us__hero__info"}>
                        <div className={"about-us__hero__info__wrapper"}>
                            <h2 className="about-us__hero__info__title">Vår historia</h2>
                            <p className="about-us__hero__info__text">Grab 'n' Go grundades med en enkel vision: att
                                göra extraordinär asiatisk mat tillgänglig för alla, även när tiden är knapp. Vi tror
                                att snabb mat inte behöver betyda kompromisser.
                                Vårt kök kombinerar traditionella asiatiska smaker med moderna tekniker och lokala
                                ingredienser. Varje rätt är noggrant komponerad för att leverera maximalt med smak och
                                fräschör.
                                Med vårt enkla online-beställningssystem kan du njuta av restaurangkvalitet hemma, på
                                kontoret eller var du än är. Beställ, hämta och njut – det är så enkelt det är!</p>
                        </div>
                        <div className={"about-us__hero__info__image__wrapper"}>
                            <img src={"/images/about-us-hero-image.png"} alt={"About us hero image"}
                                 className={"about-us__hero__info__image"}/>
                        </div>

                    </div>
                </section>
                <section className="about-us__values">
                    <h2 className="about-us__values__title">Våra värderingar</h2>
                    <div className="about-us__values__cards">
                        <SmallCard
                            icon={<Heart size={35}/>}
                            title="Passion för mat"
                            text="Vi älskar det vi gör och det syns i varje rätt"
                        />
                        <SmallCard
                            icon={<Leaf size={35}/>}
                            title="Färska ingredienser"
                            text="Endast de bästa råvarorna från lokala leverantörer"
                        />
                        <SmallCard
                            icon={<Award size={35}/>}
                            title="Kvalitet först"
                            text="Vi kompromissar aldrig på kvalitet eller smak"
                        />
                    </div>
                </section>

                <section className="about__contact">
                    <h2 className="about__contact__title">Kontakta oss</h2>

                    <div className="about__contact-columns">
                        <div className="about__contact-column about__contact-column--location">
                            <div className="card">
                                <h3 className="about__contact-column__title">Hitta hit</h3>

                                <address className="about__contact-item" aria-label="Address">
                                    <span className="about__contact-item__icon" aria-hidden="true"><MapPin/></span>
                                    <div className="about__contact-item__content">
                                        <div className="about__contact-item__label">Storgatan 123</div>
                                        <div className="about__contact-item__line">111 22 Stockholm</div>
                                    </div>
                                </address>

                                <div className="about__contact-item" aria-label="Opening hours">
                                    <span className="about__contact-item__icon" aria-hidden="true"><Clock/></span>
                                    <div className="about__contact-item__content">
                                        <div className="about__contact-item__label">Öppettider</div>
                                        <div className="about__contact-item__line">Mån–Fre: 11:00 - 21:00</div>
                                        <div className="about__contact-item__line">Lör–Sön: 12:00 - 21:00</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="about__contact-column about__contact-column--contact">
                                <h3 className="about__contact-column__title">Kontakt</h3>

                                <div className="about__contact-item" aria-label="Phone">
                                    <span className="about__contact-item__icon" aria-hidden="true"><Phone/></span>
                                    <div className="about__contact-item__content">
                                        <div className="about__contact-item__label">Telefon</div>
                                        <a className="about__contact-item__link" href="tel:08-123 45 67">08-123 45 67</a>
                                    </div>
                                </div>

                                <div className="about__contact-item" aria-label="Email">
                                    <span className="about__contact-item__icon" aria-hidden="true"><Mail/></span>
                                    <div className="about__contact-item__content">
                                        <div className="about__contact-item__label">E-post</div>
                                        <div className="about__contact-item__line">
                                            <a href="mailto:info@grabngo.se"
                                               className="about__contact-item__link">info@grabngo.se</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </section>

            <Footer/>
        </>
    );
}