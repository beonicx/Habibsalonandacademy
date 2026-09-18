"use client";
import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Loader, Search, PackageMinus, PackagePlus } from "lucide-react";
import { products } from "../../../lib/adminApi";

const emptyForm = {
  name: "", description: "", category: "", sku: "", price: "",
  costPrice: "", stock: "", lowStockThreshold: "5", image: "", brand: "",
};

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [stockAdj, setStockAdj] = useState({ adjustment: "", reason: "" });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      if (lowStock) params.lowStock = "true";
      const res = await products.getAll(params);
      if (res.success) {
        setItems(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const res = await products.getCategories();
      if (res.success) setCategories(res.data || []);
    } catch { /* ignore */ }
  }

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { load(); }, [page, search, catFilter, lowStock]);

  function openCreate() {
    setForm(emptyForm);
    setModal("create");
  }

  function openEdit(prod) {
    setForm({
      name: prod.name || "",
      description: prod.description || "",
      category: prod.category || "",
      sku: prod.sku || "",
      price: prod.price ?? "",
      costPrice: prod.costPrice ?? "",
      stock: prod.stock ?? "",
      lowStockThreshold: prod.lowStockThreshold ?? "5",
      image: prod.image || "",
      brand: prod.brand || "",
      _id: prod._id,
    });
    setModal("edit");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        sku: form.sku || undefined,
        price: Number(form.price),
        costPrice: Number(form.costPrice) || 0,
        stock: Number(form.stock) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
        image: form.image || undefined,
        brand: form.brand || undefined,
      };
      if (modal === "edit") {
        await products.update(form._id, payload);
      } else {
        await products.create(payload);
      }
      setModal(null);
      load();
      loadCategories();
    } catch {
      setError("Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Deactivate this product?")) return;
    try {
      await products.delete(id);
      load();
    } catch {
      setError("Failed to delete product");
    }
  }

  async function handleStockUpdate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await products.updateStock(stockModal._id, {
        adjustment: Number(stockAdj.adjustment),
        reason: stockAdj.reason,
      });
      setStockModal(null);
      setStockAdj({ adjustment: "", reason: "" });
      load();
    } catch {
      setError("Failed to update stock");
    } finally {
      setSaving(false);
    }
  }

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  let searchTimer;
  function handleSearch(e) {
    const v = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { setSearch(v); setPage(1); }, 400);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600 mt-1">Manage inventory and retail products</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#C9956B] text-white rounded-lg hover:bg-[#A67050] transition-colors self-start"
        >
          <Plus size={16} /> Add Product
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
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, brand, SKU..."
            onChange={handleSearch}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => { setLowStock(!lowStock); setPage(1); }}
          className={`px-3 py-2 text-sm border rounded-lg transition-colors ${lowStock ? "bg-red-50 border-red-200 text-red-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
        >
          Low Stock Only
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={24} className="text-[#C9956B] animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-600">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="text-left text-sm text-gray-600 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price (₹)</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((prod) => {
                  const isLow = prod.stock <= prod.lowStockThreshold;
                  return (
                    <tr key={prod._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{prod.name}</p>
                        {prod.brand && <p className="text-sm text-gray-500">{prod.brand}</p>}
                      </td>
                      <td className="px-5 py-3 text-gray-600 font-mono text-sm">{prod.sku || "—"}</td>
                      <td className="px-5 py-3 text-gray-800">{prod.category}</td>
                      <td className="px-5 py-3 text-gray-800">₹{prod.price}</td>
                      <td className="px-5 py-3 text-gray-800">{prod.stock}</td>
                      <td className="px-5 py-3">
                        {!prod.isActive ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600">Inactive</span>
                        ) : isLow ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-sm font-medium bg-red-50 text-red-700">Low Stock</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-sm font-medium bg-green-50 text-green-700">In Stock</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setStockModal(prod); setStockAdj({ adjustment: "", reason: "" }); }}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                            title="Adjust stock"
                          >
                            <PackagePlus size={14} />
                          </button>
                          <button onClick={() => openEdit(prod)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-800"><Edit3 size={14} /></button>
                          <button onClick={() => handleDelete(prod._id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>Page {pagination.page} of {pagination.pages} ({pagination.total} items)</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">
                Prev
              </button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{modal === "edit" ? "Edit Product" : "Add Product"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Name *</label>
                  <input name="name" value={form.name} onChange={change} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Category *</label>
                  <input name="category" value={form.category} onChange={change} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" placeholder="e.g. Shampoo" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">SKU</label>
                  <input name="sku" value={form.sku} onChange={change} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Price (₹) *</label>
                  <input name="price" type="number" min="0" value={form.price} onChange={change} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Cost Price (₹)</label>
                  <input name="costPrice" type="number" min="0" value={form.costPrice} onChange={change} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Stock</label>
                  <input name="stock" type="number" min="0" value={form.stock} onChange={change} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Low Stock Threshold</label>
                  <input name="lowStockThreshold" type="number" min="0" value={form.lowStockThreshold} onChange={change} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Brand</label>
                  <input name="brand" value={form.brand} onChange={change} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Image URL</label>
                  <input name="image" value={form.image} onChange={change} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={change} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B] resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-[#C9956B] text-white rounded-lg hover:bg-[#A67050] disabled:opacity-50">
                  {saving ? "Saving..." : modal === "edit" ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setStockModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Adjust Stock</h3>
              <p className="text-xs text-gray-600 mt-0.5">{stockModal.name} — current: {stockModal.stock}</p>
            </div>
            <form onSubmit={handleStockUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Adjustment (+ or −)</label>
                <input
                  type="number"
                  value={stockAdj.adjustment}
                  onChange={(e) => setStockAdj({ ...stockAdj, adjustment: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                  placeholder="e.g. 10 or -5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Reason</label>
                <input
                  type="text"
                  value={stockAdj.reason}
                  onChange={(e) => setStockAdj({ ...stockAdj, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9956B]"
                  placeholder="Optional reason"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setStockModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-[#C9956B] text-white rounded-lg hover:bg-[#A67050] disabled:opacity-50">
                  {saving ? "Updating..." : "Update Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
