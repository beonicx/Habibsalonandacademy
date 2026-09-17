"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Calendar, Clock, Loader } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  "in-progress": "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  "no-show": "bg-gray-50 text-gray-700 border-gray-200",
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No Show",
};

export default function OrdersPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function loadOrders() {
      try {
        const res = await authFetch("/bookings");
        const json = await res.json();
        if (json.success) {
          setOrders(json.data || []);
        } else {
          setError("Failed to load bookings");
        }
      } catch {
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user, authFetch]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-rose-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
            <ShoppingBag size={22} className="text-rose-gold" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-espresso">
              My Orders
            </h1>
            <p className="font-sans text-sm text-mocha">
              Your booking history and upcoming appointments
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={24} className="text-rose-gold animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 font-sans text-sm rounded-md px-4 py-3">
            {error}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const serviceName = order.services?.map((s) => s.name).join(", ") || "Service";
              const status = order.status || "pending";
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-lg border border-champagne p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-sans text-sm font-medium text-espresso">
                        {serviceName}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-sans font-medium border ${
                          statusColors[status] || statusColors.pending
                        }`}
                      >
                        {statusLabels[status] || status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 font-sans text-xs text-mocha flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(order.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {order.timeSlot}
                      </span>
                    </div>
                    {order.notes && (
                      <p className="font-sans text-xs text-mocha/60 mt-2 italic">
                        {order.notes}
                      </p>
                    )}
                  </div>
                  {order.finalAmount > 0 && (
                    <p className="font-sans text-lg font-medium text-espresso">
                      ₹{order.finalAmount}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-champagne p-12 text-center">
            <ShoppingBag size={40} className="text-champagne mx-auto mb-4" />
            <h3 className="font-display text-lg text-espresso mb-1">
              No orders yet
            </h3>
            <p className="font-sans text-sm text-mocha mb-6">
              Book your first appointment to get started
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-rose-gold text-cream px-6 py-3 font-sans text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-espresso rounded-md"
            >
              Book Now
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
