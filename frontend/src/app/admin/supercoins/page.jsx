"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Star, Plus, Minus, X, Loader, ChevronLeft, ChevronRight, Trophy, Pencil, Search } from "lucide-react";
import { superCoins } from "../../../lib/adminApi";

export default function AdminSuperCoinsPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ email: "", points: "", description: "" });
  const [editForm, setEditForm] = useState({ email: "", superCoins: "", totalSpent: "" });
  const [saving, setSaving] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [editEmailSearch, setEditEmailSearch] = useState("");
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const editDropdownRef = useRef(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoadingBoard(true);
      const res = await superCoins.getLeaderboard({ limit: 20 });
      if (res.success) setLeaderboard(res.data || []);
    } catch { setError("Failed to load leaderboard"); }
    finally { setLoadingBoard(false); }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setLoadingTxns(true);
      const res = await superCoins.getTransactions({ page, limit: 20 });
      if (res.success) {
        setTransactions(res.data || []);
        setPagination(res.pagination || { pages: 1, total: 0 });
      }
    } catch { setError("Failed to load transactions"); }
    finally { setLoadingTxns(false); }
  }, [page]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await superCoins.getCustomerEmails();
      if (res.success) setCustomerList(res.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);
  useEffect(() => { loadTransactions(); }, [loadTransactions]);
  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      if (editDropdownRef.current && !editDropdownRef.current.contains(e.target)) setShowEditDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customerList.filter(c =>
    c.email.toLowerCase().includes(emailSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(emailSearch.toLowerCase())
  );

  const filteredEditCustomers = customerList.filter(c =>
    c.email.toLowerCase().includes(editEmailSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(editEmailSearch.toLowerCase())
  );

  function selectEmail(customer) {
    setForm({ ...form, email: customer.email });
    setEmailSearch(customer.email);
    setShowDropdown(false);
  }

  function selectEditEmail(customer) {
    const found = leaderboard.find(u => u.email === customer.email);
    setEditForm({
      email: customer.email,
      superCoins: found?.superCoins ?? 0,
      totalSpent: found?.totalSpent ?? 0,
    });
    setEditEmailSearch(customer.email);
    setShowEditDropdown(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = { email: form.email, points: Number(form.points), description: form.description };
      if (modal === "add") {
        await superCoins.addPoints(data);
      } else {
        await superCoins.redeemPoints(data);
      }
      setModal(null);
      setForm({ email: "", points: "", description: "" });
      setEmailSearch("");
      await Promise.all([loadLeaderboard(), loadTransactions()]);
    } catch (err) { setError(err.message || "Failed to process"); }
    finally { setSaving(false); }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await superCoins.editCoins({
        email: editForm.email,
        superCoins: Number(editForm.superCoins),
        totalSpent: Number(editForm.totalSpent),
      });
      setModal(null);
      setEditForm({ email: "", superCoins: "", totalSpent: "" });
      setEditEmailSearch("");
      await loadLeaderboard();
    } catch (err) { setError(err.message || "Failed to update"); }
    finally { setSaving(false); }
  }

  function openEditFromLeaderboard(user) {
    setEditForm({
      email: user.email,
      superCoins: user.superCoins,
      totalSpent: user.totalSpent || 0,
    });
    setEditEmailSearch(user.email);
    setModal("edit");
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SuperCoins</h1>
          <p className="text-sm text-gray-600 mt-1">Manage SuperCoins and rewards</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setForm({ email: "", points: "", description: "" }); setEmailSearch(""); setModal("add"); }}
            className="inline-flex items-center gap-1.5 bg-[#C9956B] text-white px-4 py-2 rounded-lg hover:bg-[#A67050] text-sm font-medium">
            <Plus size={16} /> Add SuperCoins
          </button>
          <button onClick={() => { setForm({ email: "", points: "", description: "" }); setEmailSearch(""); setModal("redeem"); }}
            className="inline-flex items-center gap-1.5 border border-gray-200 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Minus size={16} /> Redeem
          </button>
          <button onClick={() => { setEditForm({ email: "", superCoins: "", totalSpent: "" }); setEditEmailSearch(""); setModal("edit"); }}
            className="inline-flex items-center gap-1.5 border border-gray-200 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Pencil size={16} /> Edit
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

      {/* Leaderboard */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-[#C9956B]" /> Leaderboard
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loadingBoard ? (
            <div className="flex justify-center py-10"><Loader size={24} className="animate-spin text-[#C9956B]" /></div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center"><p className="text-gray-600 text-sm">No SuperCoins data yet</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 uppercase w-12">#</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase">Name</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase text-right">SuperCoins</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase text-right hidden sm:table-cell">Total Spent</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase text-right hidden sm:table-cell">Visits</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase text-center w-16">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboard.map((user, i) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          i === 0 ? "bg-yellow-100 text-yellow-700" :
                          i === 1 ? "bg-gray-100 text-gray-700" :
                          i === 2 ? "bg-orange-100 text-orange-700" :
                          "text-gray-500"
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#C9956B]">{user.superCoins}</td>
                      <td className="px-4 py-3 text-right text-gray-700 hidden sm:table-cell">₹{user.totalSpent || 0}</td>
                      <td className="px-4 py-3 text-right text-gray-700 hidden sm:table-cell">{user.visitCount || 0}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => openEditFromLeaderboard(user)}
                          className="p-1.5 text-gray-400 hover:text-[#C9956B] hover:bg-gray-100 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loadingTxns ? (
            <div className="flex justify-center py-10"><Loader size={24} className="animate-spin text-[#C9956B]" /></div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center"><p className="text-gray-600 text-sm">No transactions yet</p></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 uppercase">User</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase text-right">SuperCoins</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase hidden md:table-cell">Description</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase text-right hidden sm:table-cell">Balance</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map(t => (
                      <tr key={t._id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-3">
                          <p className="font-medium text-gray-900">{t.user?.name || "—"}</p>
                          <p className="text-sm text-gray-600">{t.user?.email || ""}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs uppercase font-medium px-2 py-0.5 rounded-full ${
                            t.type === "earned" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${t.type === "earned" ? "text-green-600" : "text-red-600"}`}>
                          {t.type === "earned" ? "+" : "-"}{t.points}
                        </td>
                        <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate hidden md:table-cell">{t.description || "—"}</td>
                        <td className="px-4 py-3 text-right text-gray-600 hidden sm:table-cell">{t.balanceAfter}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                  <span className="text-gray-600">{pagination.total} transactions</span>
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
      </div>

      {/* Add / Redeem Modal */}
      {(modal === "add" || modal === "redeem") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{modal === "add" ? "Add SuperCoins" : "Redeem SuperCoins"}</h2>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div ref={dropdownRef} className="relative">
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Customer Email *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    value={emailSearch}
                    onChange={e => {
                      setEmailSearch(e.target.value);
                      setForm({ ...form, email: e.target.value });
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search by name or email"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                  />
                </div>
                {showDropdown && emailSearch && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredCustomers.slice(0, 10).map(c => (
                      <button key={c._id} type="button" onClick={() => selectEmail(c)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && emailSearch && filteredCustomers.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="text-sm text-gray-500 text-center">No customers found</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">SuperCoins *</label>
                <input required type="number" min="1" value={form.points} onChange={e => setForm({...form, points: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Reason for adjustment"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
              </div>
              <button type="submit" disabled={saving}
                className={`w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${
                  modal === "add" ? "bg-[#C9956B] hover:bg-[#A67050]" : "bg-red-600 hover:bg-red-700"
                }`}>
                {saving ? "Processing..." : modal === "add" ? "Add SuperCoins" : "Redeem SuperCoins"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal === "edit" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Edit SuperCoins & Total Spent</h2>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div ref={editDropdownRef} className="relative">
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Customer Email *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    value={editEmailSearch}
                    onChange={e => {
                      setEditEmailSearch(e.target.value);
                      setEditForm({ ...editForm, email: e.target.value });
                      setShowEditDropdown(true);
                    }}
                    onFocus={() => setShowEditDropdown(true)}
                    placeholder="Search by name or email"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                  />
                </div>
                {showEditDropdown && editEmailSearch && filteredEditCustomers.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredEditCustomers.slice(0, 10).map(c => (
                      <button key={c._id} type="button" onClick={() => selectEditEmail(c)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </button>
                    ))}
                  </div>
                )}
                {showEditDropdown && editEmailSearch && filteredEditCustomers.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="text-sm text-gray-500 text-center">No customers found</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">SuperCoins *</label>
                <input required type="number" min="0" value={editForm.superCoins} onChange={e => setEditForm({...editForm, superCoins: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Total Spent (₹) *</label>
                <input required type="number" min="0" value={editForm.totalSpent} onChange={e => setEditForm({...editForm, totalSpent: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
              </div>
              <button type="submit" disabled={saving || !editForm.email}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 bg-[#C9956B] hover:bg-[#A67050]">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
