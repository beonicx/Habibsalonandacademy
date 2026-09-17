import Link from "next/link";
import { Scissors, Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream/80 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scissors size={20} className="text-rose-gold" />
              <span className="font-display text-xl text-cream">
                <span className="text-rose-gold">Habib</span> Salon & Academy
              </span>
            </div>
            <p className="font-body text-sm text-cream/60 leading-relaxed mb-6">
              Premium beauty services delivered with passion, expertise, and personalised care.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/habibsalonacademy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Habib Salon on Instagram"
                className="w-9 h-9 rounded-full border border-cream/20 flex items-center justify-center hover:border-rose-gold hover:text-rose-gold transition-colors duration-300"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com/habibsalonacademy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Habib Salon on Facebook"
                className="w-9 h-9 rounded-full border border-cream/20 flex items-center justify-center hover:border-rose-gold hover:text-rose-gold transition-colors duration-300"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-rose-gold mb-5">
              Services
            </h4>
            <ul className="space-y-2 font-body text-sm">
              {["Hair", "Skin & Facials", "Makeup", "Nails", "Men's Grooming", "Spa"].map((s) => (
                <li key={s}>
                  <Link
                    href="/services"
                    className="text-cream/70 hover:text-rose-gold transition-colors duration-300"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-rose-gold mb-5">
              Quick Links
            </h4>
            <ul className="space-y-2 font-body text-sm">
              {[
                { label: "About Us", href: "/about" },
                { label: "Gallery", href: "/gallery" },
                { label: "Book Appointment", href: "/booking" },
                { label: "Contact", href: "/contact" },
                { label: "Offers", href: "/services" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-cream/70 hover:text-rose-gold transition-colors duration-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <address className="not-italic">
            <h4 className="font-sans text-xs tracking-widest uppercase text-rose-gold mb-5">
              Visit Us
            </h4>
            <ul className="space-y-4 font-body text-sm text-cream/70">
              <li className="flex gap-3">
                <MapPin size={16} className="text-rose-gold mt-1 shrink-0" />
                <span>Mathiya (Baghi), Ghazipur, Uttar Pradesh, India</span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="text-rose-gold shrink-0" />
                <a
                  href="tel:+919565459518"
                  className="hover:text-rose-gold transition-colors duration-300"
                >
                  +91 9565 459518
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="text-rose-gold shrink-0" />
                <a
                  href="mailto:pankajyadav@habibsalonacademy.com"
                  className="hover:text-rose-gold transition-colors duration-300"
                >
                  pankajyadav@habibsalonacademy.com
                </a>
              </li>
            </ul>
            <div className="mt-5 font-body text-sm text-cream/70">
              <p className="text-cream/40 text-xs mb-1 uppercase tracking-wider">Opening Hours</p>
              <p>Mon–Sat: 9:00 am – 8:00 pm</p>
              <p>Sunday: 10:00 am – 6:00 pm</p>
            </div>
          </address>
        </div>

        <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cream/40 font-sans">
          <p>© {new Date().getFullYear()} Habib Salon & Academy. All rights reserved.</p>
          <p>Crafted with love for beautiful hair</p>
        </div>
      </div>
    </footer>
  );
}
