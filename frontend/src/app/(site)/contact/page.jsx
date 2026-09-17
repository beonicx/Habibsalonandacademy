"use client";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle, Loader } from "lucide-react";
import WhatsAppButton from "../../../components/floating/whatsapp";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.errors?.[0]?.msg || "Something went wrong.");
      }
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="bg-espresso text-cream py-20 px-6 text-center">
        <p className="font-sans text-sm tracking-[0.3em] uppercase text-rose-gold mb-3">
          Get in Touch
        </p>
        <h1 className="font-display text-6xl text-cream">Contact Habib Salon & Academy</h1>
        <p className="font-body text-cream/60 mt-4 max-w-xl mx-auto">
          Visit us at Mathiya (Baghi), Ghazipur or call +91 9565 459518 for appointments and enquiries.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <p className="font-sans text-sm tracking-[0.3em] uppercase text-rose-gold mb-4">Find Us</p>
            <h2 className="font-display text-4xl text-espresso mb-8">
              We're Here for <em className="italic text-rose-gold">You</em>
            </h2>

            <address className="not-italic space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="text-rose-gold mt-1 shrink-0"><MapPin size={20} /></div>
                <div>
                  <p className="font-sans text-xs tracking-widest uppercase text-mocha/60 mb-1">Address</p>
                  <p className="font-body text-espresso">Mathiya (Baghi), Ghazipur<br />Uttar Pradesh, India</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-rose-gold mt-1 shrink-0"><Phone size={20} /></div>
                <div>
                  <p className="font-sans text-xs tracking-widest uppercase text-mocha/60 mb-1">Phone</p>
                  <p className="font-body text-espresso">
                    <a href="tel:+919565459518" className="hover:text-rose-gold transition-colors">+91 9565 459518</a>
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-rose-gold mt-1 shrink-0"><Mail size={20} /></div>
                <div>
                  <p className="font-sans text-xs tracking-widest uppercase text-mocha/60 mb-1">Email</p>
                  <p className="font-body text-espresso">
                    <a href="mailto:pankajyadav@habibsalonacademy.com" className="hover:text-rose-gold transition-colors">pankajyadav@habibsalonacademy.com</a>
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-rose-gold mt-1 shrink-0"><Clock size={20} /></div>
                <div>
                  <p className="font-sans text-xs tracking-widest uppercase text-mocha/60 mb-1">Hours</p>
                  <p className="font-body text-espresso">Mon–Sat: 9:00 AM – 8:00 PM<br />Sunday: 10:00 AM – 6:00 PM</p>
                </div>
              </div>
            </address>

            {/* Map placeholder */}
            <div className="w-full h-56 bg-champagne flex items-center justify-center border border-champagne">
              <div className="text-center text-mocha/50">
                <MapPin size={32} className="mx-auto mb-2 text-rose-gold" />
                <p className="font-sans text-xs tracking-widest uppercase">
                  Mathiya, Baghi, Ghazipur, Uttar Pradesh
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            {success ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <CheckCircle size={56} className="text-rose-gold mb-4" />
                <h3 className="font-display text-3xl text-espresso mb-3">Message Sent!</h3>
                <p className="font-body text-mocha">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                  }}
                  className="inline-flex items-center gap-2 border border-rose-gold text-rose-gold px-8 py-3.5 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-rose-gold hover:text-cream mt-8"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { name: "name", label: "Full Name", type: "text", placeholder: "Your name", required: true },
                    { name: "email", label: "Email", type: "email", placeholder: "you@example.com", required: true },
                    { name: "phone", label: "Phone (optional)", type: "tel", placeholder: "+91 9876543210" },
                    { name: "subject", label: "Subject", type: "text", placeholder: "How can we help?", required: true },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-2">
                        {field.label}
                      </label>
                      <input
                        name={field.name}
                        type={field.type}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full border border-champagne px-4 py-3 font-body text-espresso focus:outline-none focus:border-rose-gold transition-colors duration-300 bg-cream"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    required
                    placeholder="Tell us about your enquiry..."
                    className="w-full border border-champagne px-4 py-3 font-body text-espresso focus:outline-none focus:border-rose-gold transition-colors duration-300 bg-cream resize-none"
                  />
                </div>
                {error && (
                  <p className="text-red-600 font-sans text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center gap-2 bg-rose-gold text-cream px-8 py-4 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-espresso hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <><Loader size={16} className="animate-spin" /> Sending...</>
                  ) : (
                    "Send Message"
                  )}
                </button>
                <WhatsAppButton />
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
