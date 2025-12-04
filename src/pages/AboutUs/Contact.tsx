// File: `src/pages/AboutUs/Contact.tsx`
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import "./about.scss";

export default function Contact() {
    return (
        <section className="about-us__contact">
            <h2 className="about-us__contact__title">Kontakta oss</h2>

            <div className="about-us__contact__columns">
                <div className="about-us__contact__column about-us__contact__column--location">
                    <div className="card">
                        <h3 className="about-us__contact__column__title">Hitta hit</h3>

                        <address className="about-us__contact__item" aria-label="Address">
              <span className="about-us__contact__item__icon" aria-hidden="true">
                <MapPin />
              </span>
                            <div className="about-us__contact__item__content">
                                <div className="about-us__contact__item__label">Storgatan 123</div>
                                <div className="about-us__contact__item__line">111 22 Stockholm</div>
                            </div>
                        </address>

                        <div className="about-us__contact__item" aria-label="Opening hours">
              <span className="about-us__contact__item__icon" aria-hidden="true">
                <Clock />
              </span>
                            <div className="about-us__contact__item__content">
                                <div className="about-us__contact__item__label">Öppettider</div>
                                <div className="about-us__contact__item__line">
                                    Mån–Fre: 11:00 - 21:00
                                </div>
                                <div className="about-us__contact__item__line">
                                    Lör–Sön: 12:00 - 21:00
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="about-us__contact__column about-us__contact__column--contact">
                        <h3 className="about-us__contact__column__title">Kontakt</h3>

                        <div className="about-us__contact__item" aria-label="Phone">
              <span className="about-us__contact__item__icon" aria-hidden="true">
                <Phone />
              </span>
                            <div className="about-us__contact__item__content">
                                <div className="about-us__contact__item__label">Telefon</div>
                                <a
                                    className="about-us__contact__item__link"
                                    href="tel:08-123 45 67"
                                >
                                    08-123 45 67
                                </a>
                            </div>
                        </div>

                        <div className="about-us__contact__item" aria-label="Email">
              <span className="about-us__contact__item__icon" aria-hidden="true">
                <Mail />
              </span>
                            <div className="about-us__contact__item__content">
                                <div className="about-us__contact__item__label">E-post</div>
                                <div className="about-us__contact__item__line">
                                    <a
                                        href="mailto:info@grabngo.se"
                                        className="about-us__contact__item__link"
                                    >
                                        info@grabngo.se
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
