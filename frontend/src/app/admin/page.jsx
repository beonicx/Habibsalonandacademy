"use client";
import { useState, useEffect } from "react";
import { CalendarDays, Clock, IndianRupee, Users, Loader } from "lucide-react";
import { dashboard } from "../../lib/adminApi";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  "in-progress": "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  "no-show": "bg-gray-50 text-gray-700 border-gray-200",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          dashboard.getStats(),
          dashboard.getRecentBookings(),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (recentRes.success) setRecent(recentRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader size={24} className="animate-spin text-rose-gold" />
        <span className="ml-2 text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
        {error}
      </div>
    );
  }

  const cards = [
    {
      label: "Today's Bookings",
      value: stats?.todayBookings ?? 0,
      icon: CalendarDays,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Pending",
      value: stats?.pendingBookings ?? 0,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      label: "Monthly Revenue",
      value: `₹${(stats?.monthRevenue ?? 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-green-600 bg-green-50",
      sub:
        stats?.revenueGrowth !== undefined
          ? `${stats.revenueGrowth >= 0 ? "+" : ""}${stats.revenueGrowth}% vs last month`
          : null,
    },
    {
      label: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "text-rose-gold bg-rose-gold/10",
      sub: stats?.newCustomersThisMonth
        ? `+${stats.newCustomersThisMonth} this month`
        : null,
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Overview of your salon performance
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {card.label}
                </span>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              {card.sub && (
                <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Bookings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    No recent bookings
                  </td>
                </tr>
              ) : (
                recent.map((b) => (
                  <tr key={b._id} className="border-b border-gray-100 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">
                        {b.customerName}
                      </p>
                      <p className="text-xs text-gray-500">{b.customerEmail}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-800">
                      {b.services?.map((s) => s.name).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-800">
                      {new Date(b.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-gray-800">{b.timeSlot}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusColors[b.status] || statusColors.pending
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
