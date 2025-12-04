// File: `src/pages/AboutUs/AboutUs.tsx`
import Navbar from "../../components/navbar";
import Footer from "../../components/footer/Footer";
import "./about.scss";
import Hero from "./Hero";
import Values from "./Values";
import Contact from "./Contact";

export default function AboutUs() {
    return (
        <>
            <Navbar active="about" />

            <section className="about-us">
                <Hero />
                <Values />
                <Contact />
            </section>

            <Footer />
        </>
    );
}
