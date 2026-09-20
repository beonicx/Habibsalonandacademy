"use client";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-espresso">
      {/* Animated mesh gradient background */}
      <div
        className="absolute inset-0 animate-[meshMove_12s_ease-in-out_infinite]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(201,149,107,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 70%, rgba(166,112,80,0.3) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 60% 10%, rgba(232,196,160,0.2) 0%, transparent 50%),
            radial-gradient(ellipse 50% 70% at 10% 80%, rgba(201,149,107,0.15) 0%, transparent 50%)
          `,
        }}
      />

      {/* Noise/grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-[15%] right-[10%] w-72 h-72 rounded-full bg-rose-gold/10 blur-[100px] animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[20%] left-[5%] w-96 h-96 rounded-full bg-rose-dark/10 blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-[50%] right-[30%] w-64 h-64 rounded-full bg-champagne/8 blur-[80px] animate-[float_7s_ease-in-out_infinite_1s]" />

      {/* Geometric accents */}
      <div className="absolute top-[12%] right-[8%] w-64 h-64 border border-rose-gold/[0.07] rounded-full animate-[spin_40s_linear_infinite] hidden lg:block" />
      <div className="absolute top-[14%] right-[9%] w-56 h-56 border border-rose-gold/[0.05] rounded-full animate-[spin_30s_linear_infinite_reverse] hidden lg:block" />
      <div className="absolute bottom-[25%] right-[15%] w-40 h-40 border border-cream/[0.04] rotate-45 animate-[spin_50s_linear_infinite] hidden lg:block" />

      {/* Accent lines */}
      <div className="absolute top-0 right-[20%] w-px h-full bg-gradient-to-b from-transparent via-rose-gold/10 to-transparent hidden lg:block" />
      <div className="absolute top-0 right-[40%] w-px h-full bg-gradient-to-b from-transparent via-cream/5 to-transparent hidden xl:block" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] hidden lg:block"
        style={{
          backgroundImage: "radial-gradient(circle, #C9956B 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-espresso via-espresso/60 to-transparent" />
      {/* Top subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(44,26,14,0.5)_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        <div className="max-w-2xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-px bg-gradient-to-r from-rose-gold to-transparent" />
            <span className="font-sans text-xs tracking-[0.3em] uppercase text-rose-gold/90">
              Premium Hair & Beauty Salon
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95] mb-6">
            Premium Salon
            <br />
            <em className="text-rose-gold not-italic">in Lucknow</em>
          </h1>

          <p className="font-body text-lg text-cream/75 mb-10 leading-relaxed max-w-lg">
            Habib Salon & Academy — expert hair styling, bridal makeup, luxury facials and spa
            treatments in Lucknow. Precision cuts, vibrant colour and personalised care by
            award-winning stylists.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/booking"
              className="group inline-flex items-center gap-2 bg-rose-gold text-cream px-8 py-3.5 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-cream hover:text-espresso hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(201,149,107,0.3)]"
            >
              Book Appointment <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 border border-cream/30 text-cream px-8 py-3.5 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-cream/10 hover:border-cream/60 backdrop-blur-sm"
            >
              Our Services
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-16 pt-10 border-t border-cream/10">
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

      <style jsx>{`
        @keyframes meshMove {
          0%, 100% { transform: scale(1) translate(0, 0); }
          33% { transform: scale(1.05) translate(2%, -1%); }
          66% { transform: scale(0.98) translate(-1%, 2%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </section>
  );
}
