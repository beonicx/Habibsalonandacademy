"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Loader } from "lucide-react";
import { useAdminAuth } from "../layout";

export default function AdminLoginPage() {
  const { login, admin } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (admin) {
    router.push("/admin");
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-espresso px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Scissors size={36} className="text-rose-gold mx-auto mb-3" />
          <h1 className="font-display text-3xl text-cream">Admin Panel</h1>
          <p className="text-cream/50 text-sm mt-1">Sign in to manage your salon</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-gold transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-rose-gold transition-colors"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-gold text-white py-3 rounded-lg text-sm font-medium tracking-wider uppercase transition-colors hover:bg-espresso disabled:opacity-50"
          >
            {loading ? <Loader size={16} className="animate-spin mx-auto" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
