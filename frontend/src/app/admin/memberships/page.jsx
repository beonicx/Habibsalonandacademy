"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Crown, Plus, Pencil, Trash2, X, Loader, ChevronLeft, ChevronRight, XCircle, Search, UserPlus } from "lucide-react";
import { memberships, customers } from "../../../lib/adminApi";

const emptyPlan = { name: "", description: "", price: "", durationMonths: "", discountPercent: "", benefits: "" };

export default function AdminMembershipsPage() {
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [planModal, setPlanModal] = useState(null);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [assignModal, setAssignModal] = useState(false);
  const [emailQuery, setEmailQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [assigning, setAssigning] = useState(false);
  const searchTimer = useRef(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      const res = await memberships.getPlans({});
      if (res.success) setPlans(res.data || []);
    } catch { setError("Failed to load plans"); }
    finally { setLoadingPlans(false); }
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      setLoadingMembers(true);
      const res = await memberships.getMembers({ page, limit: 20 });
      if (res.success) {
        setMembers(res.data || []);
        setPagination(res.pagination || { pages: 1, total: 0 });
      }
    } catch { setError("Failed to load members"); }
    finally { setLoadingMembers(false); }
  }, [page]);

  useEffect(() => { loadPlans(); }, [loadPlans]);
  useEffect(() => { loadMembers(); }, [loadMembers]);

  function openAddPlan() {
    setPlanForm(emptyPlan);
    setPlanModal("add");
  }

  function openEditPlan(plan) {
    setPlanForm({
      name: plan.name,
      description: plan.description || "",
      price: String(plan.price),
      durationMonths: String(plan.durationMonths),
      discountPercent: String(plan.discountPercent || ""),
      benefits: (plan.benefits || []).join(", "),
    });
    setPlanModal(plan._id);
  }

  async function handleSavePlan(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = {
        name: planForm.name,
        description: planForm.description,
        price: Number(planForm.price),
        durationMonths: Number(planForm.durationMonths),
        discountPercent: planForm.discountPercent ? Number(planForm.discountPercent) : 0,
        benefits: planForm.benefits ? planForm.benefits.split(",").map(b => b.trim()).filter(Boolean) : [],
      };
      if (planModal === "add") {
        await memberships.createPlan(data);
      } else {
        await memberships.updatePlan(planModal, data);
      }
      setPlanModal(null);
      await loadPlans();
    } catch { setError("Failed to save plan"); }
    finally { setSaving(false); }
  }

  async function handleDeletePlan(id) {
    try {
      await memberships.deletePlan(id);
      setDeleteConfirm(null);
      await loadPlans();
    } catch { setError("Failed to delete plan"); }
  }

  async function handleCancelMembership(id) {
    try {
      await memberships.cancel(id);
      await loadMembers();
    } catch { setError("Failed to cancel membership"); }
  }

  function openAssign() {
    setAssignModal(true);
    setEmailQuery("");
    setUserResults([]);
    setSelectedUser(null);
    setSelectedPlan(plans[0]?._id || "");
    setPaymentMethod("cash");
  }

  function handleEmailSearch(value) {
    setEmailQuery(value);
    setSelectedUser(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (value.length < 2) { setUserResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await customers.getAll({ search: value, limit: 6 });
        if (res.success) setUserResults(res.data || []);
      } catch { /* ignore */ }
      finally { setSearchingUsers(false); }
    }, 300);
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!selectedUser || !selectedPlan) {
      setError("Please select a user and plan");
      return;
    }
    setAssigning(true);
    setError("");
    try {
      const res = await memberships.assign({ userId: selectedUser._id, planId: selectedPlan, paymentMethod });
      if (!res.success) throw new Error(res.error || "Failed to assign membership");
      setAssignModal(false);
      await loadMembers();
    } catch (err) { setError(err.message || "Failed to assign membership"); }
    finally { setAssigning(false); }
  }

  const statusStyle = {
    active: "bg-green-100 text-green-700",
    expired: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
    suspended: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Memberships</h1>
        <p className="text-sm text-gray-600 mt-1">Manage membership plans and members</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

      {/* Plans Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Plans</h2>
          <button onClick={openAddPlan} className="inline-flex items-center gap-2 bg-[#C9956B] text-white px-4 py-2 rounded-lg hover:bg-[#A67050] text-sm font-medium">
            <Plus size={16} /> Add Plan
          </button>
        </div>

        {loadingPlans ? (
          <div className="flex justify-center py-10"><Loader size={24} className="animate-spin text-[#C9956B]" /></div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <Crown size={32} className="text-gray-500 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No plans created yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan._id} className={`bg-white rounded-xl border shadow-sm p-5 ${plan.isActive ? "border-gray-200" : "border-red-200 opacity-60"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{plan.name}</h3>
                    {plan.description && <p className="text-xs text-gray-600 mt-0.5">{plan.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditPlan(plan)} className="p-1 text-gray-500 hover:text-gray-700"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteConfirm(plan._id)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#C9956B]">₹{plan.price}<span className="text-xs font-normal text-gray-500 ml-1">/ {plan.durationMonths} mo</span></p>
                {plan.discountPercent > 0 && <p className="text-xs text-green-600 mt-1">{plan.discountPercent}% discount on services</p>}
                {plan.benefits && plan.benefits.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {plan.benefits.map((b, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                        <span className="text-[#C9956B] mt-0.5">•</span> {b}
                      </li>
                    ))}
                  </ul>
                )}
                {!plan.isActive && <p className="text-xs text-red-500 mt-2 font-medium">Inactive</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Members Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Members</h2>
          <button onClick={openAssign} className="inline-flex items-center gap-2 bg-[#C9956B] text-white px-4 py-2 rounded-lg hover:bg-[#A67050] text-sm font-medium">
            <UserPlus size={16} /> Assign Membership
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loadingMembers ? (
            <div className="flex justify-center py-10"><Loader size={24} className="animate-spin text-[#C9956B]" /></div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center"><p className="text-gray-600 text-sm">No members yet</p></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-600 uppercase">User</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase">Plan</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase hidden sm:table-cell">Start</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase hidden sm:table-cell">End</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {members.map(m => (
                      <tr key={m._id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-3">
                          <p className="font-medium text-gray-900">{m.user?.name || "—"}</p>
                          <p className="text-sm text-gray-600">{m.user?.email || ""}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-800">{m.plan?.name || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{new Date(m.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{new Date(m.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs uppercase font-medium px-2 py-0.5 rounded-full ${statusStyle[m.status] || "bg-gray-100 text-gray-700"}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {m.status === "active" && (
                            <button onClick={() => handleCancelMembership(m._id)}
                              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1">
                              <XCircle size={12} /> Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                  <span className="text-gray-600">{pagination.total} members</span>
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

      {/* Plan Modal */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPlanModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">{planModal === "add" ? "Add Plan" : "Edit Plan"}</h2>
              <button onClick={() => setPlanModal(null)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Name *</label>
                <input required value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Description</label>
                <textarea value={planForm.description} onChange={e => setPlanForm({...planForm, description: e.target.value})} rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Price (₹) *</label>
                  <input required type="number" min="0" value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Duration (months) *</label>
                  <input required type="number" min="1" value={planForm.durationMonths} onChange={e => setPlanForm({...planForm, durationMonths: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Discount %</label>
                <input type="number" min="0" max="100" value={planForm.discountPercent} onChange={e => setPlanForm({...planForm, discountPercent: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Benefits (comma-separated)</label>
                <input value={planForm.benefits} onChange={e => setPlanForm({...planForm, benefits: e.target.value})} placeholder="Benefit 1, Benefit 2, ..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-[#C9956B] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#A67050] disabled:opacity-50">
                {saving ? "Saving..." : planModal === "add" ? "Create Plan" : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <Trash2 size={32} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Plan?</h3>
            <p className="text-sm text-gray-600 mb-6">This will deactivate the plan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDeletePlan(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Membership Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setAssignModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Assign Membership</h2>
              <button onClick={() => setAssignModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Search User by Email *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={emailQuery}
                    onChange={(e) => handleEmailSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                    placeholder="Type email to search users..."
                    autoFocus
                  />
                  {searchingUsers && <Loader size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
                </div>
                {userResults.length > 0 && !selectedUser && (
                  <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                    {userResults.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => { setSelectedUser(u); setEmailQuery(u.email); setUserResults([]); }}
                        className="w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                        {u.phone && <span className="text-xs text-gray-400">{u.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
                {selectedUser && (
                  <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">{selectedUser.name}</p>
                      <p className="text-xs text-green-600">{selectedUser.email}{selectedUser.phone ? ` · ${selectedUser.phone}` : ""}</p>
                    </div>
                    <button type="button" onClick={() => { setSelectedUser(null); setEmailQuery(""); }} className="text-green-600 hover:text-green-800">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Plan *</label>
                <select
                  required
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                >
                  <option value="">Select a plan</option>
                  {plans.filter((p) => p.isActive).map((p) => (
                    <option key={p._id} value={p._id}>{p.name} — ₹{p.price} / {p.durationMonths} mo</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={assigning || !selectedUser || !selectedPlan}
                className="w-full bg-[#C9956B] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#A67050] disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Assign Membership"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
