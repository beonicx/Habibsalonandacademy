"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const categories = ["all", "hair", "skin", "makeup", "nails", "spa"];

export default function GalleryPage() {
  const [active, setActive] = useState("all");
  const [gallery, setGallery] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/gallery`);
        if (!res.ok) { setError(true); return; }
        const json = await res.json();
        if (json.success) {
          setGallery(json.data || []);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const filtered = active === "all" ? gallery : gallery.filter((g) => g.category === active);

  return (
    <div className="pt-16">
      <div className="bg-espresso text-cream py-12 sm:py-20 px-4 sm:px-6 text-center">
        <p className="font-sans text-xs sm:text-sm tracking-[0.3em] uppercase text-rose-gold mb-3">Our Work</p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-6xl text-cream">Our Work & Transformations</h1>
        <p className="font-body text-sm sm:text-base text-cream/60 mt-4 max-w-xl mx-auto">
          Browse hair styling, bridal makeup, facial results and nail art from Habib Salon & Academy, Ghazipur.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-8 sm:mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`font-sans text-[10px] sm:text-xs tracking-widest uppercase px-3 sm:px-6 py-2 sm:py-2.5 border transition-all duration-300 ${
                active === cat
                  ? "bg-rose-gold text-cream border-rose-gold"
                  : "border-champagne text-mocha hover:border-rose-gold hover:text-rose-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {!loaded ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-rose-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error || filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-mocha/60">
              {error ? "Unable to load gallery. Please try again later." : "No images found in this category."}
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((img) => (
              <div key={img.id} className="break-inside-avoid group relative overflow-hidden">
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/50 transition-all duration-300 flex items-end">
                  <p className="font-display text-cream text-base sm:text-xl p-3 sm:p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {img.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10 sm:mt-16">
          <p className="font-body text-sm sm:text-base text-mocha mb-4 sm:mb-6">Inspired? Your transformation awaits.</p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-rose-gold text-cream px-6 sm:px-8 py-3 sm:py-3.5 font-sans text-xs sm:text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-espresso hover:scale-105 active:scale-95"
          >
            Book an Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
