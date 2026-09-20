"use client";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-espresso">
      {/* Background image with zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-[slowZoom_25s_ease-in-out_infinite_alternate]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80')",
        }}
      />

      {/* Dark overlay — keeps text readable */}
      <div className="absolute inset-0 bg-espresso/70" />

      {/* Rose-gold warm wash */}
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(201,149,107,0.6) 0%, transparent 50%, rgba(166,112,80,0.4) 100%)",
        }}
      />

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
        }}
      />

      {/* Soft glow orbs */}
      <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-rose-gold/8 blur-[150px] animate-[drift_14s_ease-in-out_infinite]" />
      <div className="absolute bottom-[5%] left-[0%] w-[400px] h-[400px] rounded-full bg-rose-dark/10 blur-[130px] animate-[drift_18s_ease-in-out_infinite_reverse]" />

      {/* Decorative gold ring — right side */}
      <div className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[420px] h-[420px] hidden lg:block">
        <div className="absolute inset-0 rounded-full border border-rose-gold/[0.08] animate-[spin_60s_linear_infinite]" />
        <div className="absolute inset-4 rounded-full border border-cream/[0.04] animate-[spin_45s_linear_infinite_reverse]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-rose-gold/20" />
        </div>
      </div>

      {/* Horizontal gold line accent */}
      <div className="absolute top-[30%] left-0 w-[45%] h-px bg-gradient-to-r from-transparent via-rose-gold/15 to-transparent hidden lg:block" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,transparent_30%,rgba(44,26,14,0.55)_100%)]" />

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-cream/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 w-full">
        <div className="max-w-2xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-px bg-gradient-to-r from-rose-gold to-rose-gold/0" />
            <span className="font-sans text-[11px] tracking-[0.35em] uppercase text-rose-gold">
              Premium Hair & Beauty Salon
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] text-cream leading-[0.92] mb-7 animate-fade-up">
            Premium Salon
            <br />
            <span className="relative inline-block">
              <em className="text-rose-gold not-italic">in Lucknow</em>
              <span className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-rose-gold/50 via-rose-gold/20 to-transparent" />
            </span>
          </h1>

          <p className="font-body text-lg text-cream/70 mb-10 leading-relaxed max-w-lg animate-fade-up [animation-delay:200ms]">
            Habib Salon & Academy — expert hair styling, bridal makeup, luxury facials and spa
            treatments in Lucknow. Precision cuts, vibrant colour and personalised care by
            award-winning stylists.
          </p>

          <div className="flex flex-wrap gap-4 animate-fade-up [animation-delay:400ms]">
            <Link
              href="/booking"
              className="group relative inline-flex items-center gap-2 bg-rose-gold text-cream px-9 py-4 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-cream hover:text-espresso active:scale-95 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              Book Appointment <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 border border-cream/25 text-cream px-9 py-4 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:border-rose-gold/50 hover:text-rose-gold backdrop-blur-sm"
            >
              Our Services
            </Link>
          </div>

          {/* Stats with glass card */}
          <div className="mt-16 px-8 py-6 rounded-sm border border-cream/[0.06] bg-cream/[0.03] backdrop-blur-md inline-flex gap-12 animate-fade-up [animation-delay:600ms]">
            {[
              { value: "12+", label: "Years Experience" },
              { value: "8K+", label: "Happy Clients" },
              { value: "4.9", label: "Star Rating", icon: true },
            ].map((stat, i) => (
              <div key={stat.label} className={`${i > 0 ? "border-l border-cream/10 pl-12" : ""}`}>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-3xl text-cream">{stat.value}</span>
                  {stat.icon && <Star size={16} className="text-rose-gold fill-rose-gold" />}
                </div>
                <p className="font-sans text-[10px] text-cream/45 tracking-[0.2em] uppercase mt-1.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/30">
        <span className="font-sans text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-cream/15 relative overflow-hidden">
          <div className="w-full h-1/2 bg-rose-gold/60 absolute top-0 animate-bounce" />
        </div>
      </div>

      <style jsx>{`
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        @keyframes drift {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(10px); }
        }
      `}</style>
    </section>
  );
}
