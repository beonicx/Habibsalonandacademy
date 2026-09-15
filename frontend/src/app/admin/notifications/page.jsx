"use client";
import { useState, useEffect, useCallback } from "react";
import { Bell, Send, Megaphone, Trash2, X, Loader, ChevronLeft, ChevronRight } from "lucide-react";
import { notifications } from "../../../lib/adminApi";

const TYPE_FILTERS = ["all", "booking", "payment", "promotion", "membership", "supercoins", "system"];

const typeStyle = {
  booking: "bg-blue-100 text-blue-700",
  payment: "bg-green-100 text-green-700",
  promotion: "bg-purple-100 text-purple-700",
  membership: "bg-orange-100 text-orange-700",
  supercoins: "bg-yellow-100 text-yellow-700",
  system: "bg-gray-100 text-gray-700",
};

export default function AdminNotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: "", message: "", type: "system", userId: "" });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (typeFilter !== "all") params.type = typeFilter;
      const res = await notifications.getAll(params);
      if (res.success) {
        setItems(res.data || []);
        setPagination(res.pagination || { pages: 1, total: 0 });
      }
    } catch { setError("Failed to load notifications"); }
    finally { setLoading(false); }
  }, [page, typeFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [typeFilter]);

  async function handleSend(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (modal === "single") {
        const data = { title: form.title, message: form.message, type: form.type };
        if (form.userId.trim()) data.userId = form.userId.trim();
        await notifications.create(data);
      } else {
        await notifications.sendBulk({ title: form.title, message: form.message, type: form.type || "promotion" });
      }
      setModal(null);
      setForm({ title: "", message: "", type: "system", userId: "" });
      await load();
    } catch { setError("Failed to send notification"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      await notifications.delete(id);
      setDeleteConfirm(null);
      await load();
    } catch { setError("Failed to delete"); }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and send notifications</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setForm({ title: "", message: "", type: "system", userId: "" }); setModal("single"); }}
            className="inline-flex items-center gap-1.5 bg-[#C9956B] text-white px-4 py-2 rounded-lg hover:bg-[#A67050] text-sm font-medium">
            <Send size={14} /> Send
          </button>
          <button onClick={() => { setForm({ title: "", message: "", type: "promotion", userId: "" }); setModal("bulk"); }}
            className="inline-flex items-center gap-1.5 border border-gray-200 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Megaphone size={14} /> Bulk Send
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TYPE_FILTERS.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${typeFilter === t ? "bg-[#C9956B] text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-[#C9956B]"}`}>
            {t}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader size={24} className="animate-spin text-[#C9956B]" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={40} className="text-gray-500 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No notifications found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-xs font-medium text-gray-600 uppercase">Title</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase hidden md:table-cell">User</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase hidden sm:table-cell">Channel</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase hidden sm:table-cell">Read</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(n => (
                    <tr key={n._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-3">
                        <p className="font-medium text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-600 truncate max-w-[250px]">{n.message}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {n.isBroadcast ? (
                          <span className="text-xs text-purple-600 font-medium">Broadcast</span>
                        ) : n.user ? (
                          <span className="text-gray-800">{n.user.name || n.user.email}</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded-full ${typeStyle[n.type] || typeStyle.system}`}>
                          {n.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize hidden sm:table-cell">{n.channel || "in-app"}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`inline-block w-2 h-2 rounded-full ${n.isRead ? "bg-green-400" : "bg-gray-300"}`} />
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDeleteConfirm(n._id)} className="p-1 text-gray-500 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-600">{pagination.total} notifications</span>
                <div className="flex items-center gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <span className="text-gray-700">{page} / {pagination.pages}</span>
                  <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
                    className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Send Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{modal === "single" ? "Send Notification" : "Bulk Send to All Users"}</h2>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSend} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Message *</label>
                <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B] resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]">
                  {["system", "booking", "payment", "promotion", "membership", "supercoins"].map(t => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
              {modal === "single" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">User ID (optional)</label>
                  <input value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} placeholder="Leave empty for system notification"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
              )}
              {modal === "bulk" && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-lg px-4 py-2.5">
                  This will send the notification to all active users.
                </div>
              )}
              <button type="submit" disabled={saving}
                className="w-full bg-[#C9956B] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#A67050] disabled:opacity-50">
                {saving ? "Sending..." : modal === "single" ? "Send Notification" : "Send to All Users"}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <Trash2 size={32} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Notification?</h3>
            <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
