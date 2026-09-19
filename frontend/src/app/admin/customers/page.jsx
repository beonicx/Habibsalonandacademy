"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X, Loader, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { customers } from "../../../lib/adminApi";

export default function CustomersPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await customers.getAll({ page, limit: 20, search: search || undefined });
      if (res.success) {
        setData(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await customers.create(form);
      if (res.success) {
        setShowModal(false);
        setForm({ name: "", email: "", phone: "", gender: "", address: "" });
        loadData();
      } else {
        setError(res.error || "Failed to create customer");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-rose-gold text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity self-start"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="mb-5 max-w-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-gold"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={20} className="animate-spin text-rose-gold" />
            <span className="ml-2 text-sm text-gray-600">Loading...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-600 uppercase tracking-wider bg-gray-50">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Visits</th>
                  <th className="px-5 py-3">Total Spent</th>
                  <th className="px-5 py-3">SuperCoins</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  data.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => router.push(`/admin/customers/${c._id}`)}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 cursor-pointer"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${c.activeMembership ? "bg-amber-100 text-amber-700" : "bg-rose-gold/10 text-rose-gold"}`}>
                            {c.activeMembership ? <Crown size={14} /> : (c.name?.charAt(0)?.toUpperCase() || "?")}
                          </div>
                          <div>
                            <span className="font-medium text-black hover:underline">{c.name}</span>
                            {c.activeMembership && (
                              <p className="text-xs text-amber-600 font-medium">{c.activeMembership.planName} Member</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{c.email}</td>
                      <td className="px-5 py-3 text-gray-700">{c.phone || "—"}</td>
                      <td className="px-5 py-3 text-gray-800">{c.visitCount || 0}</td>
                      <td className="px-5 py-3 text-gray-800">₹{(c.totalSpent || 0).toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3 text-gray-800">{c.superCoins || 0}</td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add Customer</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Name *</label>
                <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-gold" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-gold" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-gold" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-gold bg-white">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Address</label>
                <input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-gold" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="px-4 py-2.5 bg-rose-gold text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {creating ? "Creating..." : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
