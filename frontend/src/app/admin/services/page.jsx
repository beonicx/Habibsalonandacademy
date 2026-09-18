"use client";
import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Loader, Database, ToggleLeft, ToggleRight } from "lucide-react";
import { services } from "../../../lib/adminApi";

const emptyForm = {
  category: "", categorySlug: "", categoryDescription: "", categoryIcon: "",
  name: "", description: "", price: "", duration: "",
};

export default function ServicesPage() {
  const [grouped, setGrouped] = useState([]);
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await services.getAll();
      if (res.success) {
        setGrouped(res.data || []);
        setRaw(res.raw || []);
      }
    } catch {
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate(cat) {
    setForm({
      ...emptyForm,
      category: cat?.category || "",
      categorySlug: cat?.slug || "",
      categoryDescription: cat?.description || "",
      categoryIcon: cat?.icon || "",
    });
    setModal("create");
  }

  function openEdit(svc) {
    setForm({
      category: svc.category || "",
      categorySlug: svc.categorySlug || "",
      categoryDescription: svc.categoryDescription || "",
      categoryIcon: svc.categoryIcon || "",
      name: svc.name || "",
      description: svc.description || "",
      price: svc.price ?? "",
      duration: svc.duration ?? "",
      _id: svc._id,
    });
    setModal("edit");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        category: form.category,
        categorySlug: form.categorySlug,
        categoryDescription: form.categoryDescription,
        categoryIcon: form.categoryIcon,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        duration: Number(form.duration),
      };
      if (modal === "edit") {
        await services.update(form._id, payload);
      } else {
        await services.create(payload);
      }
      setModal(null);
      load();
    } catch {
      setError("Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Deactivate this service?")) return;
    try {
      await services.delete(id);
      load();
    } catch {
      setError("Failed to delete service");
    }
  }

  async function toggleActive(svc) {
    try {
      await services.update(svc._id, { isActive: !svc.isActive });
      load();
    } catch {
      setError("Failed to toggle service");
    }
  }

  async function handleSeed() {
    if (!confirm("This will add default services from the backend. Continue?")) return;
    setSeeding(true);
    try {
      await services.seed();
      load();
    } catch {
      setError("Failed to seed services");
    } finally {
      setSeeding(false);
    }
  }

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your salon service catalogue</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Database size={14} />
            {seeding ? "Seeding..." : "Seed Defaults"}
          </button>
          <button
            onClick={() => openCreate(null)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#C9956B] text-white rounded-lg hover:bg-[#A67050] transition-colors"
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
          {error}
          <button onClick={() => setError("")} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size={24} className="text-[#C9956B] animate-spin" />
        </div>
      ) : raw.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <Loader size={32} className="text-gray-500 mx-auto mb-3" />
          <p className="text-gray-600">No services yet. Click "Seed Defaults" to populate or add one manually.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((cat) => (
            <div key={cat.slug} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{cat.category}</h2>
                  {cat.description && (
                    <p className="text-sm text-gray-600 mt-0.5">{cat.description}</p>
                  )}
                </div>
                <button
                  onClick={() => openCreate(cat)}
                  className="text-xs text-[#C9956B] hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> Add to category
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 uppercase tracking-wider border-b border-gray-100">
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Price (₹)</th>
                      <th className="px-5 py-3 font-medium">Duration</th>
                      <th className="px-5 py-3 font-medium">Active</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.items.map((svc) => (
                      <tr key={svc._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{svc.name}</p>
                          {svc.description && (
                            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{svc.description}</p>
                          )}
                        </td>
                        <td className="px-5 py-3 text-gray-800">₹{svc.price}</td>
                        <td className="px-5 py-3 text-gray-800">{svc.duration} min</td>
                        <td className="px-5 py-3">
                          <button onClick={() => toggleActive(svc)} title="Toggle active">
                            {svc.isActive ? (
                              <ToggleRight size={22} className="text-green-500" />
                            ) : (
                              <ToggleLeft size={22} className="text-gray-500" />
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(svc)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(svc._id)}
                              className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {modal === "edit" ? "Edit Service" : "Add Service"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Category</label>
                  <input name="category" value={form.category} onChange={change} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" placeholder="e.g. Hair" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Category Slug</label>
                  <input name="categorySlug" value={form.categorySlug} onChange={change} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" placeholder="e.g. hair" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Service Name</label>
                <input name="name" value={form.name} onChange={change} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" placeholder="e.g. Haircut & Styling" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Description</label>
                <input name="description" value={form.description} onChange={change} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" placeholder="Short description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input name="price" type="number" min="0" value={form.price} onChange={change} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Duration (min)</label>
                  <input name="duration" type="number" min="0" value={form.duration} onChange={change} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-[#C9956B] text-white rounded-lg hover:bg-[#A67050] disabled:opacity-50">
                  {saving ? "Saving..." : modal === "edit" ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
