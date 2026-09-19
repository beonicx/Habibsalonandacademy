"use client";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, Scissors, CreditCard, Package,
  Image, MessageSquare, Crown, Star, Bell, Ticket, Menu, X, LogOut, ChevronRight,
} from "lucide-react";
import { adminLogin } from "../../lib/adminApi";

const AdminAuthContext = createContext(null);

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/memberships", label: "Memberships", icon: Crown },
  { href: "/admin/supercoins", label: "SuperCoins", icon: Star },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/contacts", label: "Messages", icon: MessageSquare },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    const savedUser = localStorage.getItem("admin_user");
    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.role === "admin") {
          setAdmin(user);
          setToken(savedToken);
        }
      } catch {
        // invalid stored data
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await adminLogin(email, password);
    setAdmin(data.user);
    setToken(data.accessToken);
    localStorage.setItem("admin_token", data.accessToken);
    localStorage.setItem("admin_user", JSON.stringify(data.user));
    if (data.refreshToken) {
      localStorage.setItem("admin_refresh_token", data.refreshToken);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-rose-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin && pathname !== "/admin/login") {
    if (typeof window !== "undefined") router.push("/admin/login");
    return null;
  }

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-espresso z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-cream/10">
          <Link href="/admin" className="flex items-center gap-2" onClick={onClose}>
            <Scissors size={20} className="text-rose-gold" />
            <span className="font-display text-lg text-cream">
              <span className="text-rose-gold">Admin</span> Panel
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-cream/60 hover:text-cream">
            <X size={20} />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors duration-200 ${
                  active
                    ? "bg-rose-gold/20 text-rose-gold"
                    : "text-cream/60 hover:text-cream hover:bg-cream/5"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function AdminShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAdminAuth();
  const pathname = usePathname();

  if (pathname === "/admin/login") return children;

  const crumbs = pathname.split("/").filter(Boolean).slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-700 hover:text-gray-900"
            >
              <Menu size={22} />
            </button>
            <nav className="hidden sm:flex items-center gap-1 text-sm text-gray-600">
              <Link href="/admin" className="hover:text-gray-900">Admin</Link>
              {crumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronRight size={14} />
                  <span className={i === crumbs.length - 1 ? "text-gray-900 font-medium capitalize" : "capitalize"}>
                    {crumb.replace(/-/g, " ")}
                  </span>
                </span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {admin && (
              <span className="hidden sm:block text-sm text-gray-700">
                {admin.name}
              </span>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
