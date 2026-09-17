const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

async function adminFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/admin/login";
    }
    throw new Error("Unauthorized");
  }

  return res;
}

function qs(params) {
  if (!params) return "";
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") p.append(k, v);
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export async function adminLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  if (data.user?.role !== "admin") throw new Error("Admin access required");
  return data;
}

export const dashboard = {
  getStats: () => adminFetch("/admin/dashboard/stats").then((r) => r.json()),
  getRecentBookings: () => adminFetch("/admin/dashboard/recent-bookings").then((r) => r.json()),
  getRevenueChart: (period) => adminFetch(`/admin/dashboard/revenue-chart${qs({ period })}`).then((r) => r.json()),
};

export const appointments = {
  getAll: (params) => adminFetch(`/admin/appointments${qs(params)}`).then((r) => r.json()),
  getToday: () => adminFetch("/admin/appointments/today").then((r) => r.json()),
  getById: (id) => adminFetch(`/admin/appointments/${id}`).then((r) => r.json()),
  create: (data) => adminFetch("/admin/appointments", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  update: (id, data) => adminFetch(`/admin/appointments/${id}`, { method: "PUT", body: JSON.stringify(data) }).then((r) => r.json()),
  updateStatus: (id, data) => adminFetch(`/admin/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }).then((r) => r.json()),
};

export const customers = {
  getAll: (params) => adminFetch(`/admin/customers${qs(params)}`).then((r) => r.json()),
  getById: (id) => adminFetch(`/admin/customers/${id}`).then((r) => r.json()),
  create: (data) => adminFetch("/admin/customers", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  update: (id, data) => adminFetch(`/admin/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }).then((r) => r.json()),
  delete: (id) => adminFetch(`/admin/customers/${id}`, { method: "DELETE" }).then((r) => r.json()),
};

export const services = {
  getAll: (params) => adminFetch(`/admin/services${qs(params)}`).then((r) => r.json()),
  getById: (id) => adminFetch(`/admin/services/${id}`).then((r) => r.json()),
  create: (data) => adminFetch("/admin/services", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  update: (id, data) => adminFetch(`/admin/services/${id}`, { method: "PUT", body: JSON.stringify(data) }).then((r) => r.json()),
  delete: (id) => adminFetch(`/admin/services/${id}`, { method: "DELETE" }).then((r) => r.json()),
  seed: () => adminFetch("/admin/services/seed", { method: "POST" }).then((r) => r.json()),
};

export const payments = {
  getAll: (params) => adminFetch(`/admin/payments${qs(params)}`).then((r) => r.json()),
  getById: (id) => adminFetch(`/admin/payments/${id}`).then((r) => r.json()),
  create: (data) => adminFetch("/admin/payments", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  refund: (id, data) => adminFetch(`/admin/payments/${id}/refund`, { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  getRevenue: (params) => adminFetch(`/admin/payments/revenue${qs(params)}`).then((r) => r.json()),
};

export const memberships = {
  getPlans: (params) => adminFetch(`/admin/memberships/plans${qs(params)}`).then((r) => r.json()),
  createPlan: (data) => adminFetch("/admin/memberships/plans", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  updatePlan: (id, data) => adminFetch(`/admin/memberships/plans/${id}`, { method: "PUT", body: JSON.stringify(data) }).then((r) => r.json()),
  deletePlan: (id) => adminFetch(`/admin/memberships/plans/${id}`, { method: "DELETE" }).then((r) => r.json()),
  getMembers: (params) => adminFetch(`/admin/memberships/members${qs(params)}`).then((r) => r.json()),
  assign: (data) => adminFetch("/admin/memberships/assign", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  cancel: (id) => adminFetch(`/admin/memberships/${id}/cancel`, { method: "PATCH" }).then((r) => r.json()),
};

export const superCoins = {
  getTransactions: (params) => adminFetch(`/admin/supercoins/transactions${qs(params)}`).then((r) => r.json()),
  getUserPoints: (userId) => adminFetch(`/admin/supercoins/user/${userId}`).then((r) => r.json()),
  addPoints: (data) => adminFetch("/admin/supercoins/add", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  redeemPoints: (data) => adminFetch("/admin/supercoins/redeem", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  getLeaderboard: (params) => adminFetch(`/admin/supercoins/leaderboard${qs(params)}`).then((r) => r.json()),
  editCoins: (data) => adminFetch("/admin/supercoins/edit", { method: "PUT", body: JSON.stringify(data) }).then((r) => r.json()),
  getCustomerEmails: () => adminFetch("/admin/supercoins/customers").then((r) => r.json()),
};

export const products = {
  getAll: (params) => adminFetch(`/admin/products${qs(params)}`).then((r) => r.json()),
  getCategories: () => adminFetch("/admin/products/categories").then((r) => r.json()),
  getById: (id) => adminFetch(`/admin/products/${id}`).then((r) => r.json()),
  create: (data) => adminFetch("/admin/products", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  update: (id, data) => adminFetch(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }).then((r) => r.json()),
  delete: (id) => adminFetch(`/admin/products/${id}`, { method: "DELETE" }).then((r) => r.json()),
  updateStock: (id, data) => adminFetch(`/admin/products/${id}/stock`, { method: "PATCH", body: JSON.stringify(data) }).then((r) => r.json()),
};

export const gallery = {
  getAll: (params) => adminFetch(`/admin/gallery${qs(params)}`).then((r) => r.json()),
  getCategories: () => adminFetch("/admin/gallery/categories").then((r) => r.json()),
  create: (data) => adminFetch("/admin/gallery", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  update: (id, data) => adminFetch(`/admin/gallery/${id}`, { method: "PUT", body: JSON.stringify(data) }).then((r) => r.json()),
  delete: (id) => adminFetch(`/admin/gallery/${id}`, { method: "DELETE" }).then((r) => r.json()),
  reorder: (items) => adminFetch("/admin/gallery/reorder", { method: "POST", body: JSON.stringify({ items }) }).then((r) => r.json()),
  upload: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return adminFetch("/admin/gallery/upload", { method: "POST", body: formData }).then((r) => r.json());
  },
};

export const contacts = {
  getAll: (params) => adminFetch(`/admin/contacts${qs(params)}`).then((r) => r.json()),
  getById: (id) => adminFetch(`/admin/contacts/${id}`).then((r) => r.json()),
  reply: (id, reply) => adminFetch(`/admin/contacts/${id}/reply`, { method: "POST", body: JSON.stringify({ reply }) }).then((r) => r.json()),
  archive: (id) => adminFetch(`/admin/contacts/${id}/archive`, { method: "PATCH" }).then((r) => r.json()),
  delete: (id) => adminFetch(`/admin/contacts/${id}`, { method: "DELETE" }).then((r) => r.json()),
};

export const notifications = {
  getAll: (params) => adminFetch(`/admin/notifications${qs(params)}`).then((r) => r.json()),
  create: (data) => adminFetch("/admin/notifications", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  sendBulk: (data) => adminFetch("/admin/notifications/bulk", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
  delete: (id) => adminFetch(`/admin/notifications/${id}`, { method: "DELETE" }).then((r) => r.json()),
};
