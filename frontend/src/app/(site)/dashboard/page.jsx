"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Edit3, Check, LogOut, Calendar, Scissors, ShoppingBag, Ticket, Coins, Lock, Eye, EyeOff, Crown } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function DashboardPage() {
  const { user, loading, logout, updateProfile, authFetch } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [coinBalance, setCoinBalance] = useState(null);
  const [membership, setMembership] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !authFetch) return;
    authFetch("/supercoins/my")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCoinBalance(data.data.balance);
      })
      .catch(() => {});
    authFetch("/memberships/my")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setMembership(data.data);
      })
      .catch(() => {});
  }, [user, authFetch]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-rose-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await updateProfile({ name, phone });
      setEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/;

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwMessage("");

    if (!PASSWORD_REGEX.test(newPassword)) {
      setPwError("Min 8 characters: 1 uppercase, 1 lowercase, 1 number, 1 special character");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError("Passwords do not match");
      return;
    }

    setChangingPw(true);
    try {
      const res = await authFetch("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPwMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setPwMessage("");
        setShowChangePassword(false);
      }, 3000);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setChangingPw(false);
    }
  }

  const pwChecks = [
    { label: "8+ chars", ok: newPassword.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(newPassword) },
    { label: "Lowercase", ok: /[a-z]/.test(newPassword) },
    { label: "Number", ok: /\d/.test(newPassword) },
    { label: "Special", ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword) },
  ];

  const isGoogleOnly = user?.authProvider === "google" && !user?.password;

  function handleLogout() {
    logout();
    router.push("/");
  }

  const userInitial = user.name?.charAt(0)?.toUpperCase() || "U";
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="min-h-screen pt-20 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-rose-gold text-cream flex items-center justify-center font-display text-3xl mx-auto mb-4">
            {userInitial}
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-espresso">
            Welcome, {user.name?.split(" ")[0]}
          </h1>
          <p className="font-sans text-sm text-mocha mt-2 flex items-center justify-center gap-2">
            <Calendar size={14} />
            Member since {memberSince}
          </p>
          {membership && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-1.5 rounded-full">
              <Crown size={14} className="text-amber-500" />
              <span className="font-sans text-xs font-semibold tracking-wide uppercase">{membership.plan?.name} Member</span>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-champagne overflow-hidden">
          <div className="px-6 py-4 border-b border-champagne flex items-center justify-between">
            <h2 className="font-display text-lg text-espresso">
              Profile Details
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 font-sans text-xs tracking-widest uppercase text-rose-gold hover:text-espresso transition-colors"
              >
                <Edit3 size={14} />
                Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 font-sans text-xs tracking-widest uppercase text-rose-gold hover:text-espresso transition-colors disabled:opacity-50"
              >
                <Check size={14} />
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>

          {message && (
            <div
              className={`mx-6 mt-4 px-4 py-2 rounded-md font-sans text-sm ${
                message.includes("success")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="p-6 space-y-5">
            {/* Name */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-champagne/50 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-rose-gold" />
              </div>
              <div className="flex-1">
                <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1">
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-cream border border-champagne rounded-md font-sans text-sm text-espresso focus:outline-none focus:border-rose-gold transition-colors"
                  />
                ) : (
                  <p className="font-sans text-sm text-espresso">{user.name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-champagne/50 flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-rose-gold" />
              </div>
              <div className="flex-1">
                <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1">
                  Email
                </label>
                <p className="font-sans text-sm text-espresso">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-champagne/50 flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-rose-gold" />
              </div>
              <div className="flex-1">
                <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1">
                  Phone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-cream border border-champagne rounded-md font-sans text-sm text-espresso focus:outline-none focus:border-rose-gold transition-colors"
                    placeholder="Add phone number"
                  />
                ) : (
                  <p className="font-sans text-sm text-espresso">
                    {user.phone || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Membership Card */}
        {membership && (
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200 overflow-hidden mt-6">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                  <Crown size={20} className="text-amber-700" />
                </div>
                <div>
                  <h3 className="font-display text-base text-espresso">{membership.plan?.name}</h3>
                  <p className="font-sans text-xs text-mocha">
                    Valid until {new Date(membership.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              {membership.plan?.discountPercent > 0 && (
                <div className="text-right">
                  <p className="font-display text-2xl text-amber-700">{membership.plan.discountPercent}%</p>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-amber-600">discount</p>
                </div>
              )}
            </div>
            {membership.plan?.benefits?.length > 0 && (
              <div className="px-6 pb-4 flex flex-wrap gap-2">
                {membership.plan.benefits.map((b, i) => (
                  <span key={i} className="font-sans text-[11px] bg-white/70 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">{b}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Change Password */}
        {!isGoogleOnly && (
          <div className="bg-white rounded-lg shadow-sm border border-champagne overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-champagne flex items-center justify-between">
              <h2 className="font-display text-lg text-espresso flex items-center gap-2">
                <Lock size={18} className="text-rose-gold" />
                Change Password
              </h2>
              <button
                onClick={() => {
                  setShowChangePassword(!showChangePassword);
                  setPwError("");
                  setPwMessage("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
                className="font-sans text-xs tracking-widest uppercase text-rose-gold hover:text-espresso transition-colors"
              >
                {showChangePassword ? "Cancel" : "Change"}
              </button>
            </div>

            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                {pwError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-sans rounded-md px-4 py-2">
                    {pwError}
                  </div>
                )}
                {pwMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-sans rounded-md px-4 py-2">
                    {pwMessage}
                  </div>
                )}

                <div>
                  <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-11 bg-cream border border-champagne rounded-md font-sans text-sm text-espresso placeholder:text-mocha/50 focus:outline-none focus:border-rose-gold transition-colors"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha/50 hover:text-mocha transition-colors"
                      tabIndex={-1}
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-11 bg-cream border border-champagne rounded-md font-sans text-sm text-espresso placeholder:text-mocha/50 focus:outline-none focus:border-rose-gold transition-colors"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha/50 hover:text-mocha transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {pwChecks.map((c) => (
                        <span
                          key={c.label}
                          className={`font-sans text-[10px] px-2 py-0.5 rounded-full border ${
                            c.ok
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-mocha/50 border-champagne"
                          }`}
                        >
                          {c.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-11 bg-cream border border-champagne rounded-md font-sans text-sm text-espresso placeholder:text-mocha/50 focus:outline-none focus:border-rose-gold transition-colors"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha/50 hover:text-mocha transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmNewPassword && newPassword !== confirmNewPassword && (
                    <p className="font-sans text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={changingPw}
                  className="w-full bg-rose-gold text-cream py-3 font-sans text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-espresso disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                >
                  {changingPw ? "Changing..." : "Change Password"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* SuperCoins Balance Card */}
        {coinBalance !== null && (
          <div className="bg-gradient-to-r from-rose-gold to-rose-dark rounded-lg p-6 text-cream mt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans text-xs uppercase tracking-widest opacity-80 mb-1">
                  SuperCoins Balance
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl">{coinBalance}</span>
                  <span className="font-sans text-sm opacity-80">coins</span>
                </div>
                <p className="font-sans text-xs mt-2 opacity-70">
                  Worth ₹{(coinBalance * 0.5).toFixed(0)} in discounts
                </p>
              </div>
              <a
                href="/supercoins"
                className="bg-cream/20 hover:bg-cream/30 transition-colors rounded-md px-4 py-2 font-sans text-xs tracking-widest uppercase"
              >
                View Details
              </a>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <a
            href="/booking"
            className="flex items-center gap-4 bg-white rounded-lg border border-champagne p-5 hover:border-rose-gold transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-rose-gold/10 flex items-center justify-center group-hover:bg-rose-gold/20 transition-colors">
              <Scissors size={20} className="text-rose-gold" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-medium text-espresso">
                Book Appointment
              </h3>
              <p className="font-sans text-xs text-mocha">
                Schedule your next visit
              </p>
            </div>
          </a>

          <a
            href="/orders"
            className="flex items-center gap-4 bg-white rounded-lg border border-champagne p-5 hover:border-rose-gold transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-rose-gold/10 flex items-center justify-center group-hover:bg-rose-gold/20 transition-colors">
              <ShoppingBag size={20} className="text-rose-gold" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-medium text-espresso">
                Orders
              </h3>
              <p className="font-sans text-xs text-mocha">
                View your booking history
              </p>
            </div>
          </a>

          <a
            href="/coupons"
            className="flex items-center gap-4 bg-white rounded-lg border border-champagne p-5 hover:border-rose-gold transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-rose-gold/10 flex items-center justify-center group-hover:bg-rose-gold/20 transition-colors">
              <Ticket size={20} className="text-rose-gold" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-medium text-espresso">
                Coupons
              </h3>
              <p className="font-sans text-xs text-mocha">
                Available discount codes
              </p>
            </div>
          </a>

          <a
            href="/supercoins"
            className="flex items-center gap-4 bg-white rounded-lg border border-champagne p-5 hover:border-rose-gold transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-rose-gold/10 flex items-center justify-center group-hover:bg-rose-gold/20 transition-colors">
              <Coins size={20} className="text-rose-gold" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-medium text-espresso">
                SuperCoins
              </h3>
              <p className="font-sans text-xs text-mocha">
                Earn & redeem rewards
              </p>
            </div>
          </a>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full bg-white rounded-lg border border-champagne p-5 hover:border-rose-gold transition-colors group text-left mt-4"
        >
          <div className="w-12 h-12 rounded-full bg-rose-gold/10 flex items-center justify-center group-hover:bg-rose-gold/20 transition-colors">
            <LogOut size={20} className="text-rose-gold" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-medium text-espresso">
              Sign Out
            </h3>
            <p className="font-sans text-xs text-mocha">
              Log out of your account
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}
