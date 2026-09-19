"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Edit3, Check, X, Loader,
  Calendar, CreditCard, Star, Crown, Clock, IndianRupee, TrendingUp,
  TrendingDown, Gift, Award, Shield,
} from "lucide-react";
import { customers } from "../../../../lib/adminApi";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  "in-progress": "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  "no-show": "bg-gray-100 text-gray-700 border-gray-200",
};

const paymentStatusColors = {
  unpaid: "bg-red-50 text-red-700",
  partial: "bg-yellow-50 text-yellow-700",
  paid: "bg-green-50 text-green-700",
  refunded: "bg-gray-100 text-gray-600",
};

const coinTypeIcons = {
  earned: TrendingUp,
  redeemed: TrendingDown,
  expired: Clock,
  adjusted: Edit3,
};

const coinTypeColors = {
  earned: "text-green-600",
  redeemed: "text-rose-600",
  expired: "text-gray-500",
  adjusted: "text-blue-600",
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [superCoinHistory, setSuperCoinHistory] = useState([]);
  const [activeMembership, setActiveMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    async function load() {
      try {
        const res = await customers.getById(id);
        if (res.success) {
          setCustomer(res.data.customer);
          setBookings(res.data.bookings || []);
          setPayments(res.data.payments || []);
          setSuperCoinHistory(res.data.superCoinHistory || []);
          setActiveMembership(res.data.activeMembership || null);
          setEditForm({
            name: res.data.customer.name || "",
            phone: res.data.customer.phone || "",
            address: res.data.customer.address || "",
          });
        } else {
          setError(res.error || "Customer not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await customers.update(id, editForm);
      if (res.success) {
        setCustomer(res.data);
        setEditing(false);
      }
    } catch {
      // keep editing open
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader size={24} className="animate-spin text-rose-gold" />
        <span className="ml-2 text-sm text-gray-600">Loading customer details...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div>
        <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={16} /> Back to Customers
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error || "Customer not found"}
        </div>
      </div>
    );
  }

  const completedBookings = bookings.filter((b) => b.status === "completed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");
  const totalPaid = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + (p.amount || 0), 0);

  const statItems = [
    { label: "Total Visits", value: customer.visitCount || 0, icon: Calendar, color: "bg-blue-50 text-blue-600" },
    { label: "Total Spent", value: `₹${(customer.totalSpent || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-green-50 text-green-600" },
    { label: "SuperCoins", value: customer.superCoins || 0, icon: Star, color: "bg-amber-50 text-amber-600" },
    { label: "Bookings", value: bookings.length, icon: Clock, color: "bg-purple-50 text-purple-600" },
  ];

  const tabs = [
    { key: "bookings", label: "Bookings", count: bookings.length },
    { key: "payments", label: "Payments", count: payments.length },
    { key: "supercoins", label: "SuperCoins", count: superCoinHistory.length },
  ];

  return (
    <>
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900">Customer Profile</h1>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-rose-gold hover:opacity-80">
              <Edit3 size={14} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <X size={14} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-sm text-rose-gold hover:opacity-80 disabled:opacity-50">
                <Check size={14} /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 ${
              activeMembership ? "bg-amber-100 text-amber-700" : "bg-rose-gold/10 text-rose-gold"
            }`}>
              {activeMembership ? <Crown size={28} /> : (customer.name?.charAt(0)?.toUpperCase() || "?")}
            </div>
            <div className="flex-1">
              {editing ? (
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-bold text-gray-900 px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-gold" />
              ) : (
                <h2 className="text-xl font-bold text-black">{customer.name}</h2>
              )}
              <p className="text-base text-gray-600">
                Member since {new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
              {customer.lastVisit && (
                <p className="text-sm text-gray-500 mt-0.5">
                  Last visit: {new Date(customer.lastVisit).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
              {activeMembership && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                  <Shield size={14} className="text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">
                    {activeMembership.plan?.name || "Active"} Member
                  </span>
                  <span className="text-sm text-amber-600">
                    &middot; expires {new Date(activeMembership.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-gray-500 flex-shrink-0" />
              <span className="text-base text-gray-800 break-all">{customer.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-gray-500 flex-shrink-0" />
              {editing ? (
                <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="text-base text-gray-800 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-rose-gold" placeholder="Phone" />
              ) : (
                <span className="text-base text-gray-800">{customer.phone || "Not provided"}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <User size={18} className="text-gray-500 flex-shrink-0" />
              <span className="text-base text-gray-800 capitalize">{customer.gender || "Not set"}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-gray-500 flex-shrink-0" />
              {editing ? (
                <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="text-base text-gray-800 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-rose-gold" placeholder="Address" />
              ) : (
                <span className="text-base text-gray-800">{customer.address || "Not provided"}</span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statItems.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className={`w-9 h-9 rounded-full ${s.color} flex items-center justify-center mx-auto mb-2`}>
                    <Icon size={16} />
                  </div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-600">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Membership Details (if active) */}
      {activeMembership && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-50/50 rounded-xl border border-amber-200 shadow-sm mb-6 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">Active Membership</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Plan</p>
              <p className="text-base font-semibold text-gray-900">{activeMembership.plan?.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Start Date</p>
              <p className="text-base text-gray-800">
                {new Date(activeMembership.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">End Date</p>
              <p className="text-base text-gray-800">
                {new Date(activeMembership.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Discount</p>
              <p className="text-base font-semibold text-amber-700">
                {activeMembership.plan?.discount ? `${activeMembership.plan.discount}% off` : "—"}
              </p>
            </div>
          </div>
          {activeMembership.remainingFreeServices?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-200">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Remaining Free Services</p>
              <div className="flex flex-wrap gap-2">
                {activeMembership.remainingFreeServices.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-full text-sm font-medium text-gray-700">
                    <Gift size={12} className="text-amber-500" />
                    {s.name} ({s.remaining} left)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3.5 text-base font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-rose-gold text-rose-gold"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {tab.label}
              <span className={`text-sm px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-rose-gold/10 text-rose-gold" : "bg-gray-100 text-gray-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="overflow-x-auto">
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Calendar size={32} className="mb-3 text-gray-300" />
                <p className="text-sm">No bookings yet</p>
              </div>
            ) : (
              <table className="w-full text-base">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-600 uppercase tracking-wider bg-gray-50">
                    <th className="px-5 py-3">Date & Time</th>
                    <th className="px-5 py-3">Services</th>
                    <th className="px-5 py-3">Stylist</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <p className="text-gray-900 font-medium whitespace-nowrap">
                          {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="text-sm text-gray-500">{b.timeSlot}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {b.services?.map((s, i) => (
                            <span key={i} className="inline-block px-2.5 py-0.5 bg-gray-100 rounded text-sm text-gray-700">
                              {s.name}
                            </span>
                          )) || <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{b.stylist || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-sm font-medium ${statusColors[b.status] || "bg-gray-100 text-gray-700"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-medium ${paymentStatusColors[b.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                          {b.paymentStatus || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <p className="text-gray-900 font-medium">
                          {b.finalAmount != null ? `₹${b.finalAmount.toLocaleString("en-IN")}` : "—"}
                        </p>
                        {b.discountAmount > 0 && (
                          <p className="text-sm text-green-600">-₹{b.discountAmount.toLocaleString("en-IN")} discount</p>
                        )}
                        {b.superCoinsUsed > 0 && (
                          <p className="text-sm text-amber-600">{b.superCoinsUsed} coins used</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {bookings.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
                <span>{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</span>
                <div className="flex gap-4">
                  <span className="text-green-600">{completedBookings.length} completed</span>
                  {cancelledBookings.length > 0 && (
                    <span className="text-red-600">{cancelledBookings.length} cancelled</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="overflow-x-auto">
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <CreditCard size={32} className="mb-3 text-gray-300" />
                <p className="text-sm">No payments yet</p>
              </div>
            ) : (
              <table className="w-full text-base">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-600 uppercase tracking-wider bg-gray-50">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">For</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Transaction ID</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3 whitespace-nowrap">
                        <p className="text-gray-900">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(p.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        {p.booking ? (
                          <div>
                            <p className="text-gray-700">
                              {p.booking.services?.map((s) => s.name).join(", ") || "Booking"}
                            </p>
                            <p className="text-sm text-gray-400">
                              {new Date(p.booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-gray-700 capitalize">
                          <CreditCard size={14} className="text-gray-400" />
                          {p.method}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-sm font-medium ${
                          p.status === "completed" ? "bg-green-50 text-green-700" :
                          p.status === "refunded" || p.status === "partially-refunded" ? "bg-red-50 text-red-700" :
                          p.status === "failed" ? "bg-red-50 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-gray-500 font-mono">
                          {p.transactionId || p.razorpayPaymentId || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <p className={`font-semibold ${p.status === "refunded" ? "text-red-600" : "text-gray-900"}`}>
                          {p.status === "refunded" ? "-" : ""}₹{p.amount?.toLocaleString("en-IN")}
                        </p>
                        {p.refundAmount > 0 && p.status !== "refunded" && (
                          <p className="text-sm text-red-500">Refund: ₹{p.refundAmount.toLocaleString("en-IN")}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {payments.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
                <span>{payments.length} payment{payments.length !== 1 ? "s" : ""}</span>
                <span className="font-semibold text-gray-700">
                  Total paid: ₹{totalPaid.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* SuperCoins Tab */}
        {activeTab === "supercoins" && (
          <div className="overflow-x-auto">
            {superCoinHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Star size={32} className="mb-3 text-gray-300" />
                <p className="text-sm">No SuperCoin transactions yet</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 p-5 border-b border-gray-100">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-xl font-bold text-green-700">
                      {superCoinHistory.filter((t) => t.type === "earned").reduce((s, t) => s + t.points, 0)}
                    </p>
                    <p className="text-sm text-green-600">Total Earned</p>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-4 text-center">
                    <p className="text-xl font-bold text-rose-700">
                      {Math.abs(superCoinHistory.filter((t) => t.type === "redeemed").reduce((s, t) => s + t.points, 0))}
                    </p>
                    <p className="text-sm text-rose-600">Total Redeemed</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <p className="text-xl font-bold text-amber-700">{customer.superCoins || 0}</p>
                    <p className="text-sm text-amber-600">Current Balance</p>
                  </div>
                </div>
                <table className="w-full text-base">
                  <thead>
                    <tr className="text-left text-sm font-medium text-gray-600 uppercase tracking-wider bg-gray-50">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3 text-right">Points</th>
                      <th className="px-5 py-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {superCoinHistory.map((t) => {
                      const TypeIcon = coinTypeIcons[t.type] || Star;
                      return (
                        <tr key={t._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                          <td className="px-5 py-3 whitespace-nowrap text-gray-700">
                            {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-sm font-medium capitalize ${coinTypeColors[t.type] || "text-gray-600"}`}>
                              <TypeIcon size={14} />
                              {t.type}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-block px-2.5 py-0.5 bg-gray-100 rounded text-sm text-gray-600 capitalize">
                              {t.source}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-600">{t.description || "—"}</td>
                          <td className="px-5 py-3 text-right">
                            <span className={`font-semibold ${t.points > 0 ? "text-green-600" : "text-rose-600"}`}>
                              {t.points > 0 ? "+" : ""}{t.points}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right text-gray-700">{t.balanceAfter}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
