"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ticket, ArrowLeft, Copy, Check, Loader } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function CouponsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await fetch(`${API_BASE}/coupons/available`);
        const data = await res.json();
        if (data.success) setCoupons(data.data);
      } catch {
        // keep empty
      } finally {
        setFetching(false);
      }
    }
    loadCoupons();
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-rose-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  }

  function getDiscountLabel(coupon) {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}% Off${coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ""}`;
    }
    return `₹${coupon.discountValue} Off`;
  }

  return (
    <section className="min-h-screen pt-20 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-sans text-sm text-mocha hover:text-rose-gold transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-rose-gold/10 flex items-center justify-center">
            <Ticket size={22} className="text-rose-gold" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-espresso">
              My Coupons
            </h1>
            <p className="font-sans text-sm text-mocha">
              Available discount codes for your next booking
            </p>
          </div>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="animate-spin text-rose-gold" />
          </div>
        ) : coupons.length > 0 ? (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="bg-white rounded-lg border border-champagne overflow-hidden flex"
              >
                <div className="bg-rose-gold/10 px-6 flex items-center justify-center border-r border-dashed border-champagne min-w-[120px]">
                  <p className="font-display text-lg text-rose-gold whitespace-nowrap text-center">
                    {getDiscountLabel(coupon)}
                  </p>
                </div>
                <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-sans text-sm font-medium text-espresso mb-0.5">
                      {coupon.description || coupon.code}
                    </h3>
                    <p className="font-sans text-xs text-mocha">
                      {coupon.minOrderAmount > 0 && `Min. order: ₹${coupon.minOrderAmount} · `}
                      Valid till{" "}
                      {new Date(coupon.validTill).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {coupon.applicableServices?.length > 0 && (
                        <span className="block mt-0.5 text-mocha/60">
                          For: {coupon.applicableServices.join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => copyCode(coupon.code)}
                    className="flex items-center gap-2 px-4 py-2 border border-rose-gold rounded-md font-sans text-xs font-medium tracking-widest uppercase text-rose-gold hover:bg-rose-gold hover:text-cream transition-all duration-300 self-start whitespace-nowrap"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check size={12} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        {coupon.code}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            <div className="text-center pt-4">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 font-sans text-sm text-rose-gold hover:text-espresso transition-colors"
              >
                Use a coupon on your next booking →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-champagne p-12 text-center">
            <Ticket size={40} className="text-champagne mx-auto mb-4" />
            <h3 className="font-display text-lg text-espresso mb-1">
              No coupons available
            </h3>
            <p className="font-sans text-sm text-mocha">
              Check back later for new offers and discounts
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
