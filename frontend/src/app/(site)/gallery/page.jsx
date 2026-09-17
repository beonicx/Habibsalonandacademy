"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const categories = ["all", "hair", "skin", "makeup", "nails", "spa"];

const staticGallery = [
  { id: 1, category: "hair", title: "Balayage Transformation", src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80" },
  { id: 2, category: "hair", title: "Sleek Blowout", src: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=600&q=80" },
  { id: 3, category: "hair", title: "Vibrant Colour", src: "https://images.unsplash.com/photo-1692318431350-1c97e0ba0dbc?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG5hdHVyYWwlMjBmaW5pc2glMjBtYWtldXAlMjB2aWJyYW50fGVufDB8fDB8fHww" },
  { id: 4, category: "skin", title: "Luxury Facial", src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80" },
  { id: 5, category: "skin", title: "Glow Treatment", src: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80" },
  { id: 6, category: "makeup", title: "Bridal Look", src: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=600&q=80" },
  { id: 7, category: "makeup", title: "Evening Glam", src: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&q=80" },
  { id: 8, category: "nails", title: "Nail Art", src: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80" },
  { id: 9, category: "spa", title: "Relaxing Massage", src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80" },
  { id: 10, category: "hair", title: "Precision Cut", src: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80" },
  { id: 11, category: "skin", title: "Skincare Ritual", src: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=600&q=80" },
  { id: 12, category: "makeup", title: "Natural Finish", src: "https://images.unsplash.com/photo-1562861021-c1ced7930457?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bmF0dXJhbCUyMGZpbmlzaCUyMG1ha2V1cHxlbnwwfHwwfHx8MA%3D%3D" },
];

export default function GalleryPage() {
  const [active, setActive] = useState("all");
  const [gallery, setGallery] = useState(staticGallery);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/gallery`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setGallery(json.data);
        }
      } catch {
        // keep static fallback
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
