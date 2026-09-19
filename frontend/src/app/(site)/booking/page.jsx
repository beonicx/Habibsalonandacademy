"use client";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader, Coins, Ticket, X, Check, CreditCard, Store } from "lucide-react";
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

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById("razorpay-script");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function BookingContent() {
  const { user, token, loading: authLoading, authFetch } = useAuth();
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service") || "";
  const [serviceOptions, setServiceOptions] = useState(staticServices);
  const [servicePrices, setServicePrices] = useState({});
  const [form, setForm] = useState({
    name: "", email: "", phone: "", service: preselectedService, date: "", time: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const [coinBalance, setCoinBalance] = useState(0);
  const [coinValue, setCoinValue] = useState(1);
  const [useCoins, setUseCoins] = useState(false);
  const [coinsToRedeem, setCoinsToRedeem] = useState(0);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("pov");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

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
          const names = [];
          const prices = {};
          json.data.forEach((cat) => {
            cat.items.forEach((item) => {
              names.push(item.name);
              if (item.price) prices[item.name] = item.price;
            });
          });
          if (names.length > 0) {
            setServiceOptions(names);
            setServicePrices(prices);
          }
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
          setCoinValue(data.data.coinValue || 1);
        }
      })
      .catch(() => {});
  }, [user, authFetch]);

  useEffect(() => {
    if (!form.date) {
      setBookedSlots([]);
      return;
    }
    setSlotsLoading(true);
    fetch(`${API_BASE}/bookings/slots?date=${form.date}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBookedSlots(data.data.bookedSlots);
      })
      .catch(() => {})
      .finally(() => setSlotsLoading(false));
  }, [form.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, phone: digits });
      setError("");
      return;
    }
    if (name === "date") {
      setForm({ ...form, date: value, time: "" });
      setError("");
      return;
    }
    setForm({ ...form, [name]: value });
    setError("");
  };

  const selectedServicePrice = servicePrices[form.service] || 0;
  const coinDiscount = useCoins ? coinsToRedeem * coinValue : 0;
  const couponDiscountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.min(
          (selectedServicePrice * appliedCoupon.discountValue) / 100,
          appliedCoupon.maxDiscount || Infinity
        )
      : appliedCoupon.discountValue
    : 0;
  const estimatedTotal = Math.max(0, selectedServicePrice - coinDiscount - couponDiscountAmount);

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

  const initiateRazorpay = useCallback(async (bookingData) => {
    setPaymentProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Please try again.");
        setPaymentProcessing(false);
        return;
      }

      const amount = estimatedTotal > 0 ? estimatedTotal : selectedServicePrice;
      if (amount <= 0) {
        setError("Cannot process online payment for ₹0. Please choose Pay on Visit.");
        setPaymentProcessing(false);
        return;
      }

      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers,
        body: JSON.stringify({ bookingId: bookingData._id, amount }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setError(orderData.error || "Failed to create payment order");
        setPaymentProcessing(false);
        return;
      }

      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Habib Salon & Academy",
        description: `Booking for ${form.service}`,
        order_id: orderData.data.orderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#C9956B" },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: bookingData._id,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setSuccess(true);
              setSuccessMessage("Booking confirmed & payment successful!");
              if (useCoins && coinsToRedeem > 0) {
                setCoinBalance((prev) => prev - coinsToRedeem);
              }
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch {
            setError("Payment verification failed. Please contact support.");
          } finally {
            setPaymentProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setError("Payment was cancelled. Your booking is saved — you can pay later or at the salon.");
            setPaymentProcessing(false);
          },
        },
      };

      if (!window.Razorpay) {
        setError("Payment gateway not available. Please refresh the page and try again.");
        setPaymentProcessing(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setError(`Payment failed: ${response.error.description || "Unknown error"}. Your booking is saved.`);
        setPaymentProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      setError("Failed to initiate payment. Please try again.");
      setPaymentProcessing(false);
    }
  }, [estimatedTotal, selectedServicePrice, form, token, useCoins, coinsToRedeem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (bookedSlots.includes(form.time)) {
      setError("This time slot is no longer available. Please choose a different time.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString().split("T")[0],
        paymentMethod,
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
        if (paymentMethod === "online") {
          setLoading(false);
          await initiateRazorpay(data.data);
        } else {
          setSuccess(true);
          setSuccessMessage(data.message || "Booking confirmed!");
          if (useCoins && coinsToRedeem > 0) {
            setCoinBalance((prev) => prev - coinsToRedeem);
          }
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
          {paymentMethod === "online" && (
            <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3 mb-4">
              <p className="font-sans text-sm text-green-700 flex items-center justify-center gap-2">
                <CreditCard size={16} />
                Payment completed successfully via Razorpay
              </p>
            </div>
          )}
          {paymentMethod === "pov" && (
            <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 mb-4">
              <p className="font-sans text-sm text-amber-700 flex items-center justify-center gap-2">
                <Store size={16} />
                Please pay at the salon during your visit
              </p>
            </div>
          )}
          {(coinDiscount > 0 || appliedCoupon) && (
            <div className="space-y-2 mb-6">
              {appliedCoupon && (
                <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3">
                  <p className="font-sans text-sm text-green-700 flex items-center justify-center gap-2">
                    <Ticket size={16} />
                    Coupon {appliedCoupon.code} applied — {couponDiscountLabel}!
                  </p>
                </div>
              )}
              {coinDiscount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3">
                  <p className="font-sans text-sm text-green-700 flex items-center justify-center gap-2">
                    <Coins size={16} />
                    {coinsToRedeem} SuperCoins redeemed — ₹{coinDiscount.toFixed(0)} discount applied!
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
              setPaymentMethod("pov");
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
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body text-mocha/60 select-none">+91</span>
                  <input
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    pattern="\d{10}"
                    placeholder="9876543210"
                    className="w-full border border-champagne pl-12 pr-4 py-3 font-body text-espresso focus:outline-none focus:border-rose-gold transition-colors duration-300 bg-cream"
                  />
                </div>
                {form.phone && form.phone.length < 10 && (
                  <p className="font-sans text-xs text-mocha/60 mt-1">{form.phone.length}/10 digits</p>
                )}
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
                    <option key={s} value={s}>
                      {s}{servicePrices[s] ? ` — ₹${servicePrices[s]}` : ""}
                    </option>
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
                  {slotsLoading && <span className="ml-2 text-rose-gold font-normal normal-case tracking-normal">checking availability...</span>}
                </label>
                <select
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  disabled={!form.date}
                  className="w-full border border-champagne px-4 py-3 font-body text-espresso focus:outline-none focus:border-rose-gold transition-colors duration-300 bg-cream disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{form.date ? "Select a time" : "Select a date first"}</option>
                  {form.date && timeSlots.map((t) => {
                    const isBooked = bookedSlots.includes(t);
                    return (
                      <option key={t} value={t} disabled={isBooked}>
                        {t}{isBooked ? " — Fully Booked" : ""}
                      </option>
                    );
                  })}
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
                          - ₹{coinDiscount.toFixed(0)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="border border-champagne rounded-lg overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3 bg-champagne/20">
                <div className="w-9 h-9 rounded-full bg-rose-gold/10 flex items-center justify-center">
                  <CreditCard size={18} className="text-rose-gold" />
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-espresso">
                    Payment Method
                  </p>
                  <p className="font-sans text-xs text-mocha">
                    Choose how you'd like to pay
                  </p>
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online")}
                    className={`relative flex items-center gap-3 px-4 py-4 rounded-lg border-2 transition-all duration-200 ${
                      paymentMethod === "online"
                        ? "border-rose-gold bg-rose-gold/5 shadow-sm"
                        : "border-champagne bg-cream hover:border-rose-gold/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === "online" ? "bg-rose-gold text-cream" : "bg-champagne/50 text-mocha"
                    }`}>
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <p className={`font-sans text-sm font-medium ${paymentMethod === "online" ? "text-espresso" : "text-mocha"}`}>
                        Pay Online
                      </p>
                      <p className="font-sans text-xs text-mocha/70">
                        UPI, Cards, Net Banking
                      </p>
                    </div>
                    {paymentMethod === "online" && (
                      <div className="absolute top-2 right-2">
                        <Check size={16} className="text-rose-gold" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pov")}
                    className={`relative flex items-center gap-3 px-4 py-4 rounded-lg border-2 transition-all duration-200 ${
                      paymentMethod === "pov"
                        ? "border-rose-gold bg-rose-gold/5 shadow-sm"
                        : "border-champagne bg-cream hover:border-rose-gold/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === "pov" ? "bg-rose-gold text-cream" : "bg-champagne/50 text-mocha"
                    }`}>
                      <Store size={20} />
                    </div>
                    <div className="text-left">
                      <p className={`font-sans text-sm font-medium ${paymentMethod === "pov" ? "text-espresso" : "text-mocha"}`}>
                        Pay on Visit
                      </p>
                      <p className="font-sans text-xs text-mocha/70">
                        Pay at the salon
                      </p>
                    </div>
                    {paymentMethod === "pov" && (
                      <div className="absolute top-2 right-2">
                        <Check size={16} className="text-rose-gold" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            {selectedServicePrice > 0 && (
              <div className="border border-champagne rounded-lg overflow-hidden">
                <div className="px-5 py-4 bg-champagne/20">
                  <p className="font-sans text-sm font-medium text-espresso">Order Summary</p>
                </div>
                <div className="px-5 py-4 space-y-2">
                  <div className="flex justify-between font-sans text-sm">
                    <span className="text-mocha">{form.service}</span>
                    <span className="text-espresso">₹{selectedServicePrice}</span>
                  </div>
                  {couponDiscountAmount > 0 && (
                    <div className="flex justify-between font-sans text-sm text-green-600">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>- ₹{couponDiscountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  {coinDiscount > 0 && (
                    <div className="flex justify-between font-sans text-sm text-green-600">
                      <span>SuperCoins ({coinsToRedeem})</span>
                      <span>- ₹{coinDiscount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="border-t border-champagne pt-2 mt-2 flex justify-between font-sans text-base font-medium">
                    <span className="text-espresso">Total</span>
                    <span className="text-espresso">₹{estimatedTotal.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-600 font-sans text-sm bg-red-50 px-4 py-3 border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || paymentProcessing}
              className="w-full inline-flex justify-center items-center gap-2 bg-rose-gold text-cream px-8 py-4 font-sans text-base font-medium tracking-widest uppercase transition-all duration-300 hover:bg-espresso hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading || paymentProcessing ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {paymentProcessing ? "Processing Payment..." : "Processing..."}
                </>
              ) : (
                <>
                  {paymentMethod === "online" ? (
                    <>
                      <CreditCard size={18} />
                      Pay & Confirm Booking
                      {estimatedTotal > 0 && (
                        <span className="text-cream/80 font-normal text-sm ml-1">
                          (₹{estimatedTotal.toFixed(0)})
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      {useCoins && coinsToRedeem > 0 && (
                        <span className="text-cream/80 font-normal text-sm ml-1">
                          (₹{coinDiscount.toFixed(0)} off)
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </button>

            <p className="text-center font-sans text-xs text-mocha/50">
              {paymentMethod === "online"
                ? "You will be redirected to Razorpay's secure payment gateway."
                : "We'll confirm your appointment by email within a few hours."}{" "}
              You may also call us at{" "}
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
