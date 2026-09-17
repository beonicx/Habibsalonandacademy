"use client";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-espresso">
      {/* Layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-espresso via-mocha/80 to-espresso" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 70% 20%, #C9956B 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, #A67050 0%, transparent 45%), radial-gradient(ellipse at 90% 70%, #E8C4A0 0%, transparent 40%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 50%, #F0E6D3 0%, transparent 60%)",
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-[15%] w-px h-32 bg-rose-gold/40 hidden lg:block" />
      <div className="absolute bottom-1/4 right-[20%] w-20 h-px bg-rose-gold/40 hidden lg:block" />
      <div className="absolute top-[12%] right-[8%] w-56 h-56 border border-rose-gold/10 rounded-full hidden xl:block" />
      <div className="absolute bottom-[18%] right-[12%] w-32 h-32 border border-rose-gold/8 rounded-full hidden xl:block" />
      <div className="absolute top-[60%] right-[5%] w-20 h-20 border border-rose-gold/6 rounded-full hidden xl:block" />
      <div className="absolute top-[20%] left-[3%] w-40 h-40 bg-rose-gold/8 rounded-full blur-3xl" />
      <div className="absolute bottom-[10%] right-[20%] w-60 h-60 bg-rose-gold/6 rounded-full blur-3xl" />
      <div className="absolute top-[50%] right-[35%] w-36 h-36 bg-champagne/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-espresso to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        <div className="max-w-2xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-px bg-rose-gold" />
            <span className="font-sans text-xs tracking-[0.3em] uppercase text-rose-gold">
              Premium Hair & Beauty Salon
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95] mb-6">
            Premium Salon
            <br />
            <em className="text-rose-gold not-italic">in Ghazipur</em>
          </h1>

          <p className="font-body text-lg text-cream/75 mb-10 leading-relaxed max-w-lg">
            Habib Salon & Academy — expert hair styling, bridal makeup, luxury facials and spa
            treatments in Ghazipur. Precision cuts, vibrant colour and personalised care by
            award-winning stylists.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-rose-gold text-cream px-8 py-3.5 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-espresso hover:scale-105 active:scale-95"
            >
              Book Appointment <ArrowRight size={16} />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 border border-cream/50 text-cream px-8 py-3.5 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-cream hover:text-espresso"
            >
              Our Services
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-16 pt-10 border-t border-cream/20">
            {[
              { value: "12+", label: "Years Experience" },
              { value: "8K+", label: "Happy Clients" },
              { value: "4.9", label: "Star Rating", icon: true },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex items-center gap-1">
                  <span className="font-display text-3xl text-cream">{stat.value}</span>
                  {stat.icon && <Star size={18} className="text-rose-gold fill-rose-gold" />}
                </div>
                <p className="font-sans text-xs text-cream/50 tracking-widest uppercase mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/40">
        <span className="font-sans text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-cream/20 relative overflow-hidden">
          <div className="w-full h-1/2 bg-rose-gold absolute top-0 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
