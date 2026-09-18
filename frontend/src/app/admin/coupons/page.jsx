"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Ticket, Plus, Pencil, Trash2, X, Loader, ChevronLeft, ChevronRight,
  ToggleLeft, ToggleRight, Copy, Check,
} from "lucide-react";
import { coupons } from "../../../lib/adminApi";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscount: "",
  minOrderAmount: "",
  validFrom: "",
  validTill: "",
  usageLimit: "",
  perUserLimit: "1",
  applicableServices: "",
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function toInputDate(d) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

export default function AdminCouponsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [filter, setFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filter === "active") params.active = "true";
      if (filter === "inactive") params.active = "false";
      const res = await coupons.getAll(params);
      if (res.success) {
        setList(res.data || []);
        setPagination(res.pagination || { pages: 1, total: 0 });
      }
    } catch {
      setError("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setForm({ ...emptyForm, validFrom: new Date().toISOString().split("T")[0] });
    setModal("add");
    setError("");
  }

  function openEdit(coupon) {
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
      validFrom: toInputDate(coupon.validFrom),
      validTill: toInputDate(coupon.validTill),
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      perUserLimit: String(coupon.perUserLimit ?? 1),
      applicableServices: (coupon.applicableServices || []).join(", "),
    });
    setModal(coupon._id);
    setError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = {
        code: form.code.toUpperCase().trim(),
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        validFrom: form.validFrom || new Date().toISOString(),
        validTill: form.validTill,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : 1,
        applicableServices: form.applicableServices
          ? form.applicableServices.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      let res;
      if (modal === "add") {
        res = await coupons.create(data);
      } else {
        res = await coupons.update(modal, data);
      }

      if (res.error) {
        setError(res.error);
        return;
      }

      setModal(null);
      await load();
    } catch {
      setError("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await coupons.delete(id);
      setDeleteConfirm(null);
      await load();
    } catch {
      setError("Failed to delete coupon");
    }
  }

  async function handleToggleActive(coupon) {
    try {
      await coupons.update(coupon._id, { isActive: !coupon.isActive });
      await load();
    } catch {
      setError("Failed to update coupon");
    }
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  }

  function discountLabel(c) {
    if (c.discountType === "percentage") {
      return `${c.discountValue}%${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}`;
    }
    return `₹${c.discountValue}`;
  }

  function isExpired(c) {
    return new Date(c.validTill) < new Date();
  }

  function isLimitReached(c) {
    return c.usageLimit && c.usedCount >= c.usageLimit;
  }

  function statusBadge(c) {
    if (!c.isActive) return { text: "Inactive", style: "bg-gray-100 text-gray-600" };
    if (isExpired(c)) return { text: "Expired", style: "bg-red-100 text-red-700" };
    if (isLimitReached(c)) return { text: "Limit Reached", style: "bg-yellow-100 text-yellow-700" };
    return { text: "Active", style: "bg-green-100 text-green-700" };
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#C9956B] text-white px-4 py-2 rounded-lg hover:bg-[#A67050] text-sm font-medium self-start"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">
          {error}
          <button onClick={() => setError("")} className="float-right text-red-500 hover:text-red-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {["", "active", "inactive"].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? "bg-[#C9956B] text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f === "" ? "All" : f === "active" ? "Active" : "Inactive"}
          </button>
        ))}
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size={24} className="animate-spin text-[#C9956B]" />
          </div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket size={36} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No coupons found</p>
            <button
              onClick={openAdd}
              className="mt-4 text-sm text-[#C9956B] hover:text-[#A67050] font-medium"
            >
              Create your first coupon
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-xs font-medium text-gray-600 uppercase">Code</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Discount</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase hidden md:table-cell">Usage</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase hidden sm:table-cell">Valid Till</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((coupon) => {
                    const badge = statusBadge(coupon);
                    return (
                      <tr key={coupon._id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-gray-900 tracking-wide">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => copyCode(coupon.code)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copy code"
                            >
                              {copiedCode === coupon.code ? (
                                <Check size={12} className="text-green-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                          {coupon.description && (
                            <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">
                              {coupon.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">
                            {discountLabel(coupon)}
                          </span>
                          {coupon.minOrderAmount > 0 && (
                            <p className="text-xs text-gray-500">Min ₹{coupon.minOrderAmount}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-gray-800">
                            {coupon.usedCount}
                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                          </span>
                          <p className="text-xs text-gray-500">
                            {coupon.perUserLimit === 1 ? "1 per user" : `${coupon.perUserLimit} per user`}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                          {formatDate(coupon.validTill)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded-full ${badge.style}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleActive(coupon)}
                              className="p-1.5 text-gray-500 hover:text-gray-700"
                              title={coupon.isActive ? "Deactivate" : "Activate"}
                            >
                              {coupon.isActive ? (
                                <ToggleRight size={18} className="text-green-500" />
                              ) : (
                                <ToggleLeft size={18} className="text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => openEdit(coupon)}
                              className="p-1.5 text-gray-500 hover:text-gray-700"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(coupon._id)}
                              className="p-1.5 text-gray-500 hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-600">{pagination.total} coupons</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-gray-700">
                    {page} / {pagination.pages}
                  </span>
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModal(null)}>
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                {modal === "add" ? "Create Coupon" : "Edit Coupon"}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                    Coupon Code *
                  </label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-[#C9956B]"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Get 20% off on your first booking"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                    Discount Value *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 100"}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                  />
                </div>
                {form.discountType === "percentage" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                      Max Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.maxDiscount}
                      onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                    />
                  </div>
                )}
                {form.discountType === "flat" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                      Min Order (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.minOrderAmount}
                      onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                    />
                  </div>
                )}
              </div>

              {form.discountType === "percentage" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="0 for no minimum"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                    Valid Till *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.validTill}
                    onChange={(e) => setForm({ ...form, validTill: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.perUserLimit}
                    onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                  Applicable Services (comma-separated)
                </label>
                <input
                  value={form.applicableServices}
                  onChange={(e) => setForm({ ...form, applicableServices: e.target.value })}
                  placeholder="Leave empty for all services"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all services</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#C9956B] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#A67050] disabled:opacity-50"
              >
                {saving ? "Saving..." : modal === "add" ? "Create Coupon" : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <Trash2 size={32} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Coupon?</h3>
            <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
