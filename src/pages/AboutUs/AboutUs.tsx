// File: `src/pages/AboutUs/AboutUs.tsx`
import Navbar from "../../components/navbar";
import Footer from "../../components/footer/Footer";
import "./about.scss";
import Hero from "./Hero";
import Values from "./Values";
import Contact from "./Contact";
import Seo from "../../components/Seo.tsx";

export default function AboutUs() {
    return (
        <>
            <Seo title="About Us" description="Our history" />
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
