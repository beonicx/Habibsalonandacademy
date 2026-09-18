"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Edit3, Check, X, Loader,
  Calendar, CreditCard, Star,
} from "lucide-react";
import { customers } from "../../../../lib/adminApi";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  "in-progress": "bg-purple-50 text-purple-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
  "no-show": "bg-gray-100 text-gray-700",
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [superCoinHistory, setSuperCoinHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await customers.getById(id);
        if (res.success) {
          setCustomer(res.data.customer);
          setBookings(res.data.bookings || []);
          setPayments(res.data.payments || []);
          setSuperCoinHistory(res.data.superCoinHistory || []);
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
        <span className="ml-2 text-sm text-gray-600">Loading...</span>
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

  const statItems = [
    { label: "Visits", value: customer.visitCount || 0, icon: Calendar },
    { label: "Total Spent", value: `₹${(customer.totalSpent || 0).toLocaleString("en-IN")}`, icon: CreditCard },
    { label: "SuperCoins", value: customer.superCoins || 0, icon: Star },
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
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-rose-gold/10 text-rose-gold flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {customer.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              {editing ? (
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-bold text-gray-900 px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-gold" />
              ) : (
                <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
              )}
              <p className="text-sm text-gray-600">
                Member since {new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-800">{customer.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-500 flex-shrink-0" />
              {editing ? (
                <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="text-sm text-gray-800 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-rose-gold" placeholder="Phone" />
              ) : (
                <span className="text-sm text-gray-800">{customer.phone || "Not provided"}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <User size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-800 capitalize">{customer.gender || "Not set"}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-500 flex-shrink-0" />
              {editing ? (
                <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="text-sm text-gray-800 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-rose-gold" placeholder="Address" />
              ) : (
                <span className="text-sm text-gray-800">{customer.address || "Not provided"}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {statItems.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-gray-50 rounded-lg p-4 text-center">
                  <Icon size={18} className="text-rose-gold mx-auto mb-2" />
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-600">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bookings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Booking History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="text-left text-sm font-medium text-gray-600 uppercase tracking-wider bg-gray-50">
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500">No bookings yet</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="border-b border-gray-100 last:border-0">
                    <td className="px-5 py-3 text-gray-900">{b.services?.map((s) => s.name).join(", ") || "—"}</td>
                    <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{b.timeSlot}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-sm font-medium ${statusColors[b.status] || "bg-gray-100 text-gray-700"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-800">{b.finalAmount ? `₹${b.finalAmount.toLocaleString("en-IN")}` : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="text-left text-sm font-medium text-gray-600 uppercase tracking-wider bg-gray-50">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-500">No payments yet</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="border-b border-gray-100 last:border-0">
                    <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-gray-900 font-medium">₹{p.amount?.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-gray-700 capitalize">{p.method}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-sm font-medium ${
                        p.status === "completed" ? "bg-green-50 text-green-700" : p.status === "refunded" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {p.status}
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
