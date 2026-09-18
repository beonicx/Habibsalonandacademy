"use client";
import { useState, useEffect } from "react";
import { Plus, RotateCcw, Loader } from "lucide-react";
import { payments } from "../../../lib/adminApi";

const statusColors = {
  completed: "bg-green-50 text-green-700",
  pending: "bg-yellow-50 text-yellow-700",
  failed: "bg-gray-100 text-gray-700",
  refunded: "bg-red-50 text-red-700",
  "partially-refunded": "bg-orange-50 text-orange-700",
};

const methodLabels = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  "bank-transfer": "Bank Transfer",
  wallet: "Wallet",
  razorpay: "Razorpay",
  other: "Other",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function PaymentsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const [createForm, setCreateForm] = useState({
    amount: "", method: "cash", bookingId: "", userId: "", transactionId: "", notes: "",
  });

  const [refundForm, setRefundForm] = useState({ paymentId: "", amount: "", reason: "" });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      const res = await payments.getAll(params);
      if (res.success) {
        setItems(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      } else {
        setError(res.error || "Failed to load payments");
      }
    } catch {
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, statusFilter, methodFilter]);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        amount: Number(createForm.amount),
        method: createForm.method,
      };
      if (createForm.bookingId) payload.bookingId = createForm.bookingId;
      if (createForm.userId) payload.userId = createForm.userId;
      if (createForm.transactionId) payload.transactionId = createForm.transactionId;
      if (createForm.notes) payload.notes = createForm.notes;
      const res = await payments.create(payload);
      if (!res.success) throw new Error(res.error || "Failed to record payment");
      setModal(null);
      setCreateForm({ amount: "", method: "cash", bookingId: "", userId: "", transactionId: "", notes: "" });
      load();
    } catch (err) {
      setError(err.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  }

  async function handleRefund(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await payments.refund(refundForm.paymentId, {
        amount: Number(refundForm.amount),
        reason: refundForm.reason,
      });
      if (!res.success) throw new Error(res.error || "Failed to process refund");
      setModal(null);
      load();
    } catch (err) {
      setError(err.message || "Failed to process refund");
    } finally {
      setSaving(false);
    }
  }

  function openRefund(payment) {
    setRefundForm({
      paymentId: payment._id,
      amount: payment.amount,
      reason: "",
    });
    setModal("refund");
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage all transactions</p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#C9956B] text-white rounded-lg hover:bg-[#A67050] transition-colors self-start"
        >
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
          {error}
          <button onClick={() => setError("")} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
        >
          <option value="">All Methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="bank-transfer">Bank Transfer</option>
          <option value="wallet">Wallet</option>
          <option value="razorpay">Razorpay</option>
        </select>
        {(statusFilter || methodFilter) && (
          <button
            onClick={() => { setStatusFilter(""); setMethodFilter(""); setPage(1); }}
            className="text-xs text-gray-600 hover:text-gray-800 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={24} className="text-[#C9956B] animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-600">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="text-left text-sm text-gray-600 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Amount (₹)</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Transaction ID</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((pay) => (
                  <tr key={pay._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-800 whitespace-nowrap">{fmtDateTime(pay.createdAt)}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">
                        {pay.user?.name || pay.booking?.customerName || "—"}
                      </p>
                      {pay.user?.email && <p className="text-sm text-gray-500">{pay.user.email}</p>}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">₹{pay.amount}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-sm font-medium bg-gray-100 text-gray-800">
                        {methodLabels[pay.method] || pay.method}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-sm font-medium ${statusColors[pay.status] || "bg-gray-100 text-gray-700"}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 font-mono text-sm">
                      {pay.transactionId || "—"}
                      {pay.razorpayOrderId && (
                        <p className="text-xs text-gray-400 mt-0.5">Order: {pay.razorpayOrderId}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {pay.status === "completed" && (
                        <button
                          onClick={() => openRefund(pay)}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 hover:underline"
                        >
                          <RotateCcw size={12} /> Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>Page {pagination.page} of {pagination.pages} ({pagination.total} items)</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">Prev</button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create Payment Modal */}
      {modal === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Record Payment</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Amount (₹) *</label>
                  <input type="number" min="0" required value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Method *</label>
                  <select value={createForm.method} onChange={(e) => setCreateForm({ ...createForm, method: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="wallet">Wallet</option>
                    <option value="razorpay">Razorpay</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Booking ID</label>
                <input value={createForm.bookingId} onChange={(e) => setCreateForm({ ...createForm, bookingId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">User ID</label>
                <input value={createForm.userId} onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Transaction ID</label>
                <input value={createForm.transactionId} onChange={(e) => setCreateForm({ ...createForm, transactionId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Notes</label>
                <textarea value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B] resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-[#C9956B] text-white rounded-lg hover:bg-[#A67050] disabled:opacity-50">
                  {saving ? "Saving..." : "Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {modal === "refund" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Process Refund</h3>
            </div>
            <form onSubmit={handleRefund} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Refund Amount (₹) *</label>
                <input type="number" min="0" required value={refundForm.amount} onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Reason</label>
                <textarea value={refundForm.reason} onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B] resize-none" placeholder="Reason for refund" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {saving ? "Processing..." : "Process Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
