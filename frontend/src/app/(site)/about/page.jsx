import Link from "next/link";
import { Award, Heart, Leaf, Scissors, Users } from "lucide-react";

export const metadata = {
  title: "About Us — Our Story, Team & Values",
  description:
    "Learn about Habib Salon & Academy in Ghazipur — founded in 2012, 12+ years of expertise in hair, beauty, bridal makeup & skincare. Meet our team of expert stylists.",
  alternates: { canonical: "https://habibsalonacademy.com/about" },
};

const team = [
  { name: "Habib", role: "Founder & Creative Director", speciality: "Colour & Balayage Expert" },
  { name: "Marco Ricci", role: "Senior Stylist", speciality: "Precision Cutting & Texture" },
  { name: "Aisha Patel", role: "Skincare Specialist", speciality: "Advanced Facials & Skincare" },
  { name: "Yasmine Laurel", role: "Makeup Artist", speciality: "Bridal & Editorial Makeup" },
  { name: "Daniel Park", role: "Men's Grooming Lead", speciality: "Fades, Beards & Barbering" },
  { name: "Olivia Santos", role: "Nail Technician", speciality: "Nail Art & Gel Systems" },
];

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="relative py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138daaa0c66d?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-espresso" />
        <div className="relative z-10 text-center text-cream max-w-3xl mx-auto px-6">
          <p className="font-sans text-sm tracking-[0.3em] uppercase text-rose-gold mb-4">Our Story</p>
          <h1 className="font-display text-6xl md:text-7xl text-cream leading-tight mb-6">
            About Habib Salon
            <br />
            <em className="text-rose-gold italic">& Academy</em>
          </h1>
          <p className="font-body text-cream/70 text-lg">
            Founded in 2012 in Ghazipur, Habib Salon & Academy was born from a simple belief: everyone
            deserves to feel extraordinary in their own skin.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-sans text-sm tracking-[0.3em] uppercase text-rose-gold mb-4">Who We Are</p>
            <h2 className="font-display text-4xl text-espresso mb-6">
              Where Every Client Leaves <em className="italic text-rose-gold">Glowing</em>
            </h2>
            <p className="font-body text-mocha mb-4">
              Habib Salon & Academy began as a single chair in Mayfair with a vision to combine
              world-class technical skill with a warmth and hospitality that makes every client feel at
              home. Today, we've served over 8,000 clients and built a team of passionate specialists
              across hair, skin, makeup, nails and wellness.
            </p>
            <p className="font-body text-mocha/70 mb-8">
              Our founder, Habib, trained under renowned stylists across London and Paris before
              bringing her expertise home to create a salon that redefines the luxury beauty experience —
              without the intimidation.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { v: "12+", l: "Years" },
                { v: "8K+", l: "Clients" },
                { v: "4.9★", l: "Rating" },
              ].map((s) => (
                <div key={s.l} className="text-center p-4 bg-champagne">
                  <p className="font-display text-3xl text-rose-gold">{s.v}</p>
                  <p className="font-sans text-xs tracking-widest uppercase text-mocha mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&q=80"
              alt="Habib salon interior"
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-rose-gold text-cream p-6 w-48 hidden lg:block">
              <Scissors size={28} className="mb-2" />
              <p className="font-display text-xl">Since 2012</p>
              <p className="font-sans text-xs opacity-80">Premium Salon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-champagne">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-sans text-sm tracking-[0.3em] uppercase text-rose-gold mb-3">
              What Drives Us
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-espresso">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Award size={28} />, title: "Excellence", desc: "We never compromise on quality — in skill, products, or experience." },
              { icon: <Heart size={28} />, title: "Personalisation", desc: "Every treatment is tailored to your unique hair, skin, and goals." },
              { icon: <Leaf size={28} />, title: "Responsibility", desc: "Premium products, sustainably sourced, kinder to you and the planet." },
              { icon: <Users size={28} />, title: "Inclusivity", desc: "A welcoming space for all — regardless of age, background, or style." },
            ].map((v) => (
              <div key={v.title} className="bg-cream p-8 text-center">
                <div className="text-rose-gold mx-auto w-12 h-12 flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-display text-2xl text-espresso mb-2">{v.title}</h3>
                <p className="font-body text-sm text-mocha/70">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-sans text-sm tracking-[0.3em] uppercase text-rose-gold mb-3">
              The Experts
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-espresso">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name}>
                <div className="bg-champagne h-72 flex items-center justify-center mb-4">
                  <div className="w-32 h-32 rounded-full bg-rose-gold/20 border-4 border-rose-gold flex items-center justify-center">
                    <span className="font-display text-4xl text-rose-gold">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-2xl text-espresso">{member.name}</h3>
                <p className="font-sans text-xs tracking-widest uppercase text-rose-gold mb-1">
                  {member.role}
                </p>
                <p className="font-body text-sm text-mocha/70">{member.speciality}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-espresso py-20 text-center px-6">
        <h2 className="font-display text-4xl text-cream mb-4">Ready to Meet the Team?</h2>
        <p className="font-body text-cream/60 mb-8">
          Book your first appointment and experience the Habib difference.
        </p>
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 bg-rose-gold text-cream px-8 py-3.5 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-rose-dark hover:scale-105 active:scale-95"
        >
          Book Now
        </Link>
      </section>
    </div>
  );
}
