"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader, Coins, Ticket, X, Check } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const staticServices = [
  "Haircut & Styling",
  "Hair Colour",
  "Highlights / Balayage",
  "Hair Spa & Ritual",
  "Rebonding / Smoothening",
  "Keratin Treatment",
  "Classic Facial",
  "Anti-Ageing Facial",
  "Brightening Facial",
  "Party Makeup",
  "Bridal Makeup",
  "Classic Manicure",
  "Gel Manicure",
  "Classic Pedicure",
  "Spa Pedicure",
  "Men's Haircut",
  "Beard Shaping & Trim",
  "Swedish Massage",
  "Deep Tissue Massage",
  "Aromatherapy Massage",
  "Hot Stone Therapy",
];

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM",
];

function BookingContent() {
  const { user, token, loading: authLoading, authFetch } = useAuth();
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") || "";
  const [serviceOptions, setServiceOptions] = useState(staticServices);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", service: preselectedService, date: "", time: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const [coinBalance, setCoinBalance] = useState(0);
  const [coinValue, setCoinValue] = useState(0.5);
  const [useCoins, setUseCoins] = useState(false);
  const [coinsToRedeem, setCoinsToRedeem] = useState(0);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch(`${API_BASE}/services`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          const names = json.data.flatMap((cat) =>
            cat.items.map((item) => item.name)
          );
          if (names.length > 0) setServiceOptions(names);
        }
      } catch {
        // keep static fallback
      }
    }
    loadServices();
  }, []);

  useEffect(() => {
    if (!user || !authFetch) return;
    authFetch("/supercoins/my")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCoinBalance(data.data.balance);
          setCoinValue(data.data.coinValue || 0.5);
        }
      })
      .catch(() => {});
  }, [user, authFetch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const discount = useCoins ? coinsToRedeem * coinValue : 0;

  function handleCoinsToggle(checked) {
    setUseCoins(checked);
    if (checked && coinBalance > 0) {
      setCoinsToRedeem(coinBalance);
    } else {
      setCoinsToRedeem(0);
    }
  }

  function handleCoinsChange(val) {
    const num = Math.max(0, Math.min(coinBalance, parseInt(val) || 0));
    setCoinsToRedeem(num);
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const res = await fetch(`${API_BASE}/coupons/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code: couponInput.trim(), service: form.service }),
      });
      const data = await res.json();
      if (!data.success) {
        setCouponError(data.error || "Invalid coupon");
        return;
      }
      setAppliedCoupon(data.data);
      setCouponInput("");
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
  }

  const couponDiscountLabel = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? `${appliedCoupon.discountValue}% off${appliedCoupon.maxDiscount ? ` (max ₹${appliedCoupon.maxDiscount})` : ""}`
      : `₹${appliedCoupon.discountValue} off`
    : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString().split("T")[0],
      };

      if (useCoins && coinsToRedeem > 0) {
        payload.redeemSuperCoins = coinsToRedeem;
      }
      if (appliedCoupon) {
        payload.couponCode = appliedCoupon.code;
      }

      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setSuccessMessage(data.message || "Booking confirmed!");
        if (useCoins && coinsToRedeem > 0) {
          setCoinBalance((prev) => prev - coinsToRedeem);
        }
      } else {
        setError(data.errors?.[0]?.msg || data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center max-w-md mx-auto px-6">
          <CheckCircle size={64} className="text-rose-gold mx-auto mb-6" />
          <h2 className="font-display text-4xl text-espresso mb-4">Booking Confirmed!</h2>
          <p className="font-body text-mocha mb-4">
            Thank you, {form.name}! Your appointment for <strong>{form.service}</strong> on{" "}
            <strong>{form.date}</strong> at <strong>{form.time}</strong> has been received. We'll
            send a confirmation to {form.email}.
          </p>
          {(discount > 0 || appliedCoupon) && (
            <div className="space-y-2 mb-6">
              {appliedCoupon && (
                <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3">
                  <p className="font-sans text-sm text-green-700 flex items-center justify-center gap-2">
                    <Ticket size={16} />
                    Coupon {appliedCoupon.code} applied — {couponDiscountLabel}!
                  </p>
                </div>
              )}
              {discount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3">
                  <p className="font-sans text-sm text-green-700 flex items-center justify-center gap-2">
                    <Coins size={16} />
                    {coinsToRedeem} SuperCoins redeemed — ₹{discount.toFixed(0)} discount applied!
                  </p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => {
              setSuccess(false);
              setSuccessMessage("");
              setUseCoins(false);
              setCoinsToRedeem(0);
              setAppliedCoupon(null);
              setCouponInput("");
              setCouponError("");
              setForm({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", service: "", date: "", time: "", notes: "" });
            }}
            className="inline-flex items-center gap-2 bg-rose-gold text-cream px-8 py-3.5 font-sans text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-espresso hover:scale-105 active:scale-95"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="pt-16">
      <div className="bg-espresso text-cream py-20 px-6 text-center">
        <p className="font-sans text-sm tracking-[0.3em] uppercase text-rose-gold mb-3">
          Reserve Your Spot
        </p>
        <h1 className="font-display text-6xl text-cream">Book Appointment</h1>
        <p className="font-body text-cream/60 mt-4 max-w-xl mx-auto">
          Fill in the form below and we'll confirm your booking within a few hours.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-white shadow-xl p-8 md:p-12">
          {!authLoading && user && (
            <div className="mb-8 px-4 py-3 bg-champagne/50 rounded-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-gold text-cream flex items-center justify-center font-sans text-sm font-medium flex-shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <p className="font-sans text-sm text-mocha">
                Booking as <span className="font-medium text-espresso">{user.name}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-2">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  className="w-full border border-champagne px-4 py-3 font-body text-espresso focus:outline-none focus:border-rose-gold transition-colors duration-300 bg-cream"
                />
              </div>

              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-2">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full border border-champagne px-4 py-3 font-body text-espresso focus:outline-none focus:border-rose-gold transition-colors duration-300 bg-cream"
                />
              </div>

              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-2">
                  Phone Number *
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 7700 000000"
                  className="w-full border border-champagne px-4 py-3 font-body text-espresso focus:outline-none focus:border-rose-gold transition-colors duration-300 bg-cream"
                />
              </div>

              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-2">
                  Service *
                </label>
                <select
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  required
                  className="w-full border border-champagne px-4 py-3 font-body text-espresso focus:outline-none focus:border-rose-gold transition-colors duration-300 bg-cream appearance-none"
                >
                  <option value="">Select a service</option>
                  {serviceOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-2">
                  Preferred Date *
                </label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  min={today}
                  required
                  className="w-full border border-champagne px-4 py-3 font-body text-espresso focus:outline-none focus:border-rose-gold transition-colors duration-300 bg-cream"
                />
              </div>

              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-2">
                  Preferred Time *
                </label>
                <select
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="w-full border border-champagne px-4 py-3 font-body text-espresso focus:outline-none focus:border-rose-gold transition-colors duration-300 bg-cream"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Any allergies, preferences, or special requests..."
                className="w-full border border-champagne px-4 py-3 font-body text-espresso focus:outline-none focus:border-rose-gold transition-colors duration-300 bg-cream resize-none"
              />
            </div>

            {/* Coupon Code */}
            <div className="border border-champagne rounded-lg overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3 bg-champagne/20">
                <div className="w-9 h-9 rounded-full bg-rose-gold/10 flex items-center justify-center">
                  <Ticket size={18} className="text-rose-gold" />
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-espresso">
                    Have a Coupon?
                  </p>
                  <p className="font-sans text-xs text-mocha">
                    Enter your discount code below
                  </p>
                </div>
              </div>

              <div className="px-5 py-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-600" />
                      <div>
                        <p className="font-sans text-sm font-medium text-green-700">
                          {appliedCoupon.code}
                        </p>
                        <p className="font-sans text-xs text-green-600">
                          {couponDiscountLabel}{appliedCoupon.description ? ` — ${appliedCoupon.description}` : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-green-600 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                        placeholder="Enter coupon code"
                        className="flex-1 border border-champagne px-4 py-2.5 font-sans text-sm text-espresso uppercase tracking-wider placeholder:text-mocha/40 placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-rose-gold transition-colors bg-cream rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-5 py-2.5 bg-rose-gold text-cream font-sans text-xs font-medium tracking-widest uppercase rounded-md hover:bg-espresso transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="font-sans text-xs text-red-500 mt-2">{couponError}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* SuperCoins Redemption */}
            {user && coinBalance > 0 && (
              <div className="border border-champagne rounded-lg overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between bg-champagne/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-gold/10 flex items-center justify-center">
                      <Coins size={18} className="text-rose-gold" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-espresso">
                        Use SuperCoins
                      </p>
                      <p className="font-sans text-xs text-mocha">
                        You have <span className="font-medium text-rose-gold">{coinBalance}</span> coins (worth ₹{(coinBalance * coinValue).toFixed(0)})
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCoins}
                      onChange={(e) => handleCoinsToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-champagne peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-gold"></div>
                  </label>
                </div>

                {useCoins && (
                  <div className="px-5 py-4 space-y-3">
                    <div>
                      <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                        Coins to Redeem
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={coinBalance}
                          value={coinsToRedeem}
                          onChange={(e) => handleCoinsChange(e.target.value)}
                          className="flex-1 h-2 bg-champagne rounded-lg appearance-none cursor-pointer accent-rose-gold"
                        />
                        <input
                          type="number"
                          min={0}
                          max={coinBalance}
                          value={coinsToRedeem}
                          onChange={(e) => handleCoinsChange(e.target.value)}
                          className="w-20 px-3 py-2 border border-champagne rounded-md font-sans text-sm text-center text-espresso focus:outline-none focus:border-rose-gold"
                        />
                      </div>
                    </div>
                    {coinsToRedeem > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-md px-4 py-2.5 flex items-center justify-between">
                        <p className="font-sans text-sm text-green-700">
                          Discount applied
                        </p>
                        <p className="font-sans text-sm font-medium text-green-700">
                          - ₹{discount.toFixed(0)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-red-600 font-sans text-sm bg-red-50 px-4 py-3 border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center gap-2 bg-rose-gold text-cream px-8 py-4 font-sans text-base font-medium tracking-widest uppercase transition-all duration-300 hover:bg-espresso hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  Confirm Booking
                  {useCoins && coinsToRedeem > 0 && (
                    <span className="text-cream/80 font-normal text-sm ml-1">
                      (₹{discount.toFixed(0)} off)
                    </span>
                  )}
                </>
              )}
            </button>

            <p className="text-center font-sans text-xs text-mocha/50">
              We'll confirm your appointment by email within a few hours. You may also call us at{" "}
              <a href="tel:91 9565 459518" className="text-rose-gold hover:underline">
                +91 9565 459518
              </a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense>
      <BookingContent />
    </Suspense>
  );
}
