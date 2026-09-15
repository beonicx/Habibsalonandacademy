"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Loader, ImageIcon } from "lucide-react";
import { gallery } from "../../../lib/adminApi";

const CATEGORIES = ["hair", "skin", "makeup", "nails", "spa"];

const emptyForm = { title: "", category: "hair", image: "", description: "" };

export default function AdminGalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCategory !== "all") params.category = activeCategory;
      const res = await gallery.getAll(params);
      if (res.success) setImages(res.data || []);
      else setError("Failed to load gallery");
    } catch { setError("Failed to load gallery"); }
    finally { setLoading(false); }
  }, [activeCategory]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setForm(emptyForm);
    setModal("add");
  }

  function openEdit(img) {
    setForm({ title: img.title, category: img.category, image: img.image, description: img.description || "" });
    setModal(img._id);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (modal === "add") {
        await gallery.create(form);
      } else {
        await gallery.update(modal, form);
      }
      setModal(null);
      await load();
    } catch { setError("Failed to save"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      await gallery.delete(id);
      setDeleteConfirm(null);
      await load();
    } catch { setError("Failed to delete"); }
  }

  async function toggleActive(img) {
    try {
      await gallery.update(img._id, { isActive: !img.isActive });
      await load();
    } catch { setError("Failed to update"); }
  }

  const filtered = activeCategory === "all" ? images : images.filter(i => i.category === activeCategory);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-600 mt-1">Manage salon gallery images</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-[#C9956B] text-white px-4 py-2.5 rounded-lg hover:bg-[#A67050] text-sm font-medium">
          <Plus size={16} /> Add Image
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["all", ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${activeCategory === cat ? "bg-[#C9956B] text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-[#C9956B]"}`}>
            {cat}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-20"><Loader size={24} className="animate-spin text-[#C9956B]" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <ImageIcon size={40} className="text-gray-500 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(img => (
            <div key={img._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group">
              <div className="relative aspect-[4/3] bg-gray-100">
                <img src={img.image} alt={img.title} className="w-full h-full object-cover" />
                {!img.isActive && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full">Hidden</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(img)} className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50"><Pencil size={14} className="text-gray-700" /></button>
                  <button onClick={() => setDeleteConfirm(img._id)} className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-50"><Trash2 size={14} className="text-red-500" /></button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{img.title}</h3>
                  <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{img.category}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button onClick={() => toggleActive(img)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${img.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${img.isActive ? "translate-x-4" : "translate-x-1"}`} />
                  </button>
                  <span className="text-xs text-gray-500">Order: {img.sortOrder || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{modal === "add" ? "Add Image" : "Edit Image"}</h2>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Category *</label>
                <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]">
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Image URL *</label>
                <input required value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B] resize-none" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-[#C9956B] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#A67050] disabled:opacity-50">
                {saving ? "Saving..." : modal === "add" ? "Add Image" : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <Trash2 size={32} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Image?</h3>
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
