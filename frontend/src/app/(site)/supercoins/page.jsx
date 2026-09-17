"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coins, ArrowLeft, TrendingUp, TrendingDown, Gift, Loader } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function SuperCoinsPage() {
  const { user, loading, authFetch } = useAuth();
  const router = useRouter();
  const [coinData, setCoinData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !authFetch) return;
    setFetching(true);
    authFetch("/supercoins/my")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCoinData(data.data);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user, authFetch]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-8 h-8 border-2 border-rose-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const balance = coinData?.balance ?? 0;
  const coinValue = coinData?.coinValue ?? 0.5;
  const totalEarned = coinData?.totalEarned ?? 0;
  const totalRedeemed = coinData?.totalRedeemed ?? 0;
  const history = coinData?.history ?? [];

  return (
    <section className="min-h-screen pt-32 pb-20 px-6">
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
            <Coins size={22} className="text-rose-gold" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-espresso">
              SuperCoins
            </h1>
            <p className="font-sans text-sm text-mocha">
              Earn coins on every booking, redeem for discounts
            </p>
          </div>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="animate-spin text-rose-gold" />
          </div>
        ) : (
          <>
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-rose-gold to-rose-dark rounded-lg p-8 text-cream mb-8">
              <p className="font-sans text-sm uppercase tracking-widest opacity-80 mb-1">
                Your Balance
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl">{balance}</span>
                <span className="font-sans text-sm opacity-80">SuperCoins</span>
              </div>
              <p className="font-sans text-xs mt-3 opacity-70">
                Worth ₹{(balance * coinValue).toFixed(0)} in discounts · {coinValue} per coin
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-white rounded-lg border border-champagne p-5 text-center">
                <TrendingUp size={20} className="text-green-600 mx-auto mb-2" />
                <p className="font-display text-2xl text-espresso">{totalEarned}</p>
                <p className="font-sans text-xs text-mocha mt-1">Total Earned</p>
              </div>
              <div className="bg-white rounded-lg border border-champagne p-5 text-center">
                <TrendingDown size={20} className="text-rose-gold mx-auto mb-2" />
                <p className="font-display text-2xl text-espresso">{totalRedeemed}</p>
                <p className="font-sans text-xs text-mocha mt-1">Total Redeemed</p>
              </div>
            </div>

            {/* How to Use */}
            <div className="bg-champagne/30 rounded-lg p-6 mb-10">
              <h2 className="font-display text-lg text-espresso mb-3 flex items-center gap-2">
                <Gift size={18} className="text-rose-gold" />
                How to Redeem
              </h2>
              <ul className="space-y-2 font-sans text-sm text-mocha">
                <li className="flex items-start gap-2">
                  <span className="text-rose-gold font-medium">1.</span>
                  Go to the <Link href="/booking" className="text-rose-gold hover:underline">Book Appointment</Link> page
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-gold font-medium">2.</span>
                  Toggle "Use SuperCoins" and choose how many to redeem
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-gold font-medium">3.</span>
                  Each coin is worth ₹{coinValue} off your booking
                </li>
              </ul>
            </div>

            {/* Transaction History */}
            <h2 className="font-display text-lg text-espresso mb-4">
              Coin History
            </h2>
            {history.length === 0 ? (
              <div className="bg-white rounded-lg border border-champagne px-5 py-10 text-center">
                <Coins size={32} className="text-champagne mx-auto mb-3" />
                <p className="font-sans text-sm text-mocha">No transactions yet</p>
                <p className="font-sans text-xs text-mocha/60 mt-1">
                  SuperCoins will appear here when you earn or redeem them
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg border border-champagne px-5 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.type === "earned"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {item.type === "earned" ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                      </div>
                      <div>
                        <p className="font-sans text-sm text-espresso">
                          {item.description}
                        </p>
                        <p className="font-sans text-xs text-mocha">
                          {new Date(item.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-sans text-sm font-medium ${
                        item.type === "earned" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {item.type === "earned" ? "+" : "-"}
                      {item.points}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
