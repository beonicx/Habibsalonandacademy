export const metadata = {
  title: {
    absolute: "Habib Salon & Academy | Best Hair, Beauty & Makeup Salon in Ghazipur",
  },
  description:
    "Visit Habib Salon & Academy in Ghazipur for expert hair styling, bridal makeup, luxury facials, spa treatments & men's grooming. 12+ years experience, 8000+ happy clients. Book now.",
  alternates: { canonical: "https://habibsalonacademy.com" },
};

import HeroSection from "../../components/sections/HeroSection";
import ServicesSection from "../../components/sections/ServicesSection";
import AboutSection from "../../components/sections/AboutSection";
import TestimonialsSection from "../../components/sections/TestimonialsSection";
import CTASection from "../../components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
