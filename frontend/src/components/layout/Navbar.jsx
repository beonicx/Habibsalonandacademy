"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Scissors, User, LogOut, ChevronDown, Search, ShoppingBag, Ticket, Coins, Eye, EyeOff, ArrowLeft, CalendarPlus } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading, login, register, googleLogin, logout } = useAuth();
  const profileRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const dark = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") {
        setOpen(false);
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setOpen(false);
    }
  }

  function openLogin() {
    setAuthMode("login");
    setShowAuthModal(true);
    setOpen(false);
  }

  function handleLogout() {
    logout();
    setShowProfileMenu(false);
    setOpen(false);
  }

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          dark
            ? "bg-cream/95 backdrop-blur-sm shadow-sm py-2 lg:py-3"
            : "bg-transparent py-3 lg:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <Scissors
              size={22}
              className="text-rose-gold transition-transform duration-300 group-hover:rotate-45 lg:w-[24px] lg:h-[24px]"
            />
            <span className={`font-display text-lg sm:text-xl lg:text-2xl tracking-wide transition-colors duration-500 ${dark ? "text-espresso" : "text-cream"}`}>
              <span className="text-rose-gold">Habib</span> Salon & Academy
            </span>
          </Link>

          {/* Desktop Nav - Centered Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-sm xl:text-base tracking-widest uppercase transition-colors duration-300 whitespace-nowrap ${dark ? "text-mocha hover:text-rose-gold" : "text-cream/80 hover:text-rose-gold"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search + Auth - Desktop (Right) */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-5 flex-shrink-0">
            <form onSubmit={handleSearch} className={`flex items-center rounded-md overflow-hidden border transition-colors duration-500 ${dark ? "bg-white/80 border-champagne" : "bg-cream/10 border-cream/20"}`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className={`w-36 xl:w-56 px-3 xl:px-4 py-2 font-sans text-sm focus:outline-none bg-transparent transition-colors duration-500 ${dark ? "text-espresso placeholder:text-mocha/50" : "text-cream placeholder:text-cream/40"}`}
              />
              <button
                type="submit"
                className="px-3 py-2 text-rose-gold hover:text-espresso transition-colors"
              >
                <Search size={16} />
              </button>
            </form>

            {!loading && (
              <>
                {user ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-rose-gold text-cream flex items-center justify-center font-sans text-sm font-medium transition-all duration-300 group-hover:bg-espresso">
                        {userInitial}
                      </div>
                      <ChevronDown
                        size={14}
                        className={`transition-all duration-200 ${
                          showProfileMenu ? "rotate-180" : ""
                        } ${dark ? "text-mocha" : "text-cream/70"}`}
                      />
                    </button>
                    {showProfileMenu && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-champagne overflow-hidden animate-fade-in">
                        <div className="px-4 py-3 border-b border-champagne">
                          <p className="font-sans text-sm font-medium text-espresso truncate">
                            {user.name}
                          </p>
                          <p className="font-sans text-xs text-mocha truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-mocha hover:bg-cream hover:text-rose-gold transition-colors duration-200"
                        >
                          <User size={16} />
                          My Dashboard
                        </Link>
                        <Link
                          href="/booking"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-mocha hover:bg-cream hover:text-rose-gold transition-colors duration-200"
                        >
                          <CalendarPlus size={16} />
                          Book Appointment
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-mocha hover:bg-cream hover:text-rose-gold transition-colors duration-200"
                        >
                          <ShoppingBag size={16} />
                          My Orders
                        </Link>
                        <Link
                          href="/supercoins"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-mocha hover:bg-cream hover:text-rose-gold transition-colors duration-200"
                        >
                          <Coins size={16} />
                          SuperCoins
                        </Link>
                        <Link
                          href="/coupons"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-mocha hover:bg-cream hover:text-rose-gold transition-colors duration-200"
                        >
                          <Ticket size={16} />
                          Coupons
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 font-sans text-sm text-mocha hover:bg-cream hover:text-rose-gold transition-colors duration-200 border-t border-champagne"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={openLogin}
                    className={`flex items-center gap-2 font-sans text-sm tracking-widest uppercase transition-colors duration-300 whitespace-nowrap ${dark ? "text-mocha hover:text-rose-gold" : "text-cream/80 hover:text-rose-gold"}`}
                  >
                    <User size={16} />
                    Login
                  </button>
                )}
              </>
            )}
          </div>

          {/* Mobile/Tablet right side: search icon + profile + hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            {!loading && user && (
              <Link
                href="/dashboard"
                className="w-9 h-9 rounded-full bg-rose-gold text-cream flex items-center justify-center font-sans text-sm font-medium"
              >
                {userInitial}
              </Link>
            )}
            <button
              className={`transition-colors duration-500 ${dark ? "text-espresso" : "text-cream"}`}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet drawer */}
        {open && (
          <>
            <div
              className="lg:hidden fixed inset-0 top-0 bg-espresso/30 backdrop-blur-sm z-[-1]"
              onClick={() => setOpen(false)}
            />
            <div className="lg:hidden bg-cream border-t border-champagne max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="px-3 sm:px-6 py-6 flex flex-col gap-5">
                {/* Nav Links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-sans text-base sm:text-lg tracking-widest uppercase text-mocha hover:text-rose-gold transition-colors duration-300 py-1"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Search - Mobile */}
                <form
                  onSubmit={handleSearch}
                  className="flex items-center border border-champagne rounded-lg overflow-hidden bg-white mt-1"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services..."
                    className="flex-1 min-w-0 px-4 py-3 font-sans text-base text-espresso placeholder:text-mocha/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 text-rose-gold hover:text-espresso transition-colors flex-shrink-0"
                  >
                    <Search size={18} />
                  </button>
                </form>

                {/* Auth Section - Mobile */}
                {!loading && (
                  <div className="border-t border-champagne pt-5 flex flex-col gap-4">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-rose-gold text-cream flex items-center justify-center font-sans text-base font-medium flex-shrink-0">
                            {userInitial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-sans text-base font-medium text-espresso truncate">
                              {user.name}
                            </p>
                            <p className="font-sans text-sm text-mocha truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2.5 bg-white rounded-lg border border-champagne px-4 py-3.5 font-sans text-sm sm:text-base text-mocha hover:border-rose-gold hover:text-rose-gold transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <User size={18} className="flex-shrink-0" />
                            Dashboard
                          </Link>
                          <Link
                            href="/booking"
                            className="flex items-center gap-2.5 bg-white rounded-lg border border-champagne px-4 py-3.5 font-sans text-sm sm:text-base text-mocha hover:border-rose-gold hover:text-rose-gold transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <CalendarPlus size={18} className="flex-shrink-0" />
                            Book Now
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-2.5 bg-white rounded-lg border border-champagne px-4 py-3.5 font-sans text-sm sm:text-base text-mocha hover:border-rose-gold hover:text-rose-gold transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <ShoppingBag size={18} className="flex-shrink-0" />
                            Orders
                          </Link>
                          <Link
                            href="/supercoins"
                            className="flex items-center gap-2.5 bg-white rounded-lg border border-champagne px-4 py-3.5 font-sans text-sm sm:text-base text-mocha hover:border-rose-gold hover:text-rose-gold transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <Coins size={18} className="flex-shrink-0" />
                            SuperCoins
                          </Link>
                          <Link
                            href="/coupons"
                            className="flex items-center gap-2.5 bg-white rounded-lg border border-champagne px-4 py-3.5 font-sans text-sm sm:text-base text-mocha hover:border-rose-gold hover:text-rose-gold transition-colors col-span-2"
                            onClick={() => setOpen(false)}
                          >
                            <Ticket size={18} className="flex-shrink-0" />
                            Coupons
                          </Link>
                        </div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center gap-2.5 w-full py-3.5 font-sans text-sm sm:text-base tracking-widest uppercase text-mocha hover:text-rose-gold transition-colors duration-300 border border-champagne rounded-lg bg-white"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={openLogin}
                        className="flex items-center justify-center gap-2.5 font-sans text-base tracking-widest uppercase text-cream bg-rose-gold hover:bg-espresso transition-colors duration-300 py-3.5 rounded-md"
                      >
                        <User size={18} />
                        Login / Register
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setShowAuthModal(false)}
          login={login}
          register={register}
          googleLogin={googleLogin}
        />
      )}
    </>
  );
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/;
const PASSWORD_RULES = "Min 8 characters: 1 uppercase, 1 lowercase, 1 number, 1 special character";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function PasswordInput({ value, onChange, placeholder, required = true, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 pr-11 bg-white border border-champagne rounded-md font-sans text-sm text-espresso placeholder:text-mocha/50 focus:outline-none focus:border-rose-gold transition-colors"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha/50 hover:text-mocha transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Lowercase", ok: /[a-z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special char", ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) },
  ];
  return (
    <div className="flex flex-wrap gap-2 mt-1.5">
      {checks.map((c) => (
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
  );
}

function AuthModal({ mode, setMode, onClose, login, register, googleLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleGoogleSuccess(credentialResponse) {
    setError("");
    setSubmitting(true);
    try {
      await googleLogin(credentialResponse.credential);
      onClose();
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (mode === "register" && !PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_RULES);
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      onClose();
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setSuccess("OTP sent to your email!");
      setMode("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!PASSWORD_REGEX.test(newPassword)) {
      setError(PASSWORD_RULES);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSuccess("Password reset successful! You can now sign in.");
      setMode("login");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setSuccess("");
  }

  function goToForgot() {
    setForgotEmail(email || "");
    setMode("forgot");
    setError("");
    setSuccess("");
  }

  function backToLogin() {
    setMode("login");
    setError("");
    setSuccess("");
  }

  const isForgotFlow = mode === "forgot" || mode === "otp";
  const modalTitle = {
    login: "Welcome Back",
    register: "Join Us",
    forgot: "Forgot Password",
    otp: "Reset Password",
  }[mode];
  const modalSubtitle = {
    login: "Sign in to your account",
    register: "Create your account",
    forgot: "Enter your email to receive an OTP",
    otp: "Enter the OTP and your new password",
  }[mode];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-espresso/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-cream rounded-lg shadow-2xl w-full max-w-md animate-fade-up overflow-hidden max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 text-center">
          {isForgotFlow && (
            <button
              type="button"
              onClick={backToLogin}
              className="absolute top-4 left-4 flex items-center gap-1 font-sans text-xs text-mocha hover:text-rose-gold transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          )}
          <Scissors
            size={28}
            className="text-rose-gold mx-auto mb-3"
          />
          <h2 className="font-display text-xl sm:text-2xl text-espresso">
            {modalTitle}
          </h2>
          <p className="font-sans text-sm text-mocha mt-1">
            {modalSubtitle}
          </p>
        </div>

        {/* Forgot Password: Email step */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotSubmit} className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-sans rounded-md px-4 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-champagne rounded-md font-sans text-sm text-espresso placeholder:text-mocha/50 focus:outline-none focus:border-rose-gold transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-gold text-cream py-3 font-sans text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-espresso disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              {submitting ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* OTP + New Password step */}
        {mode === "otp" && (
          <form onSubmit={handleResetSubmit} className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-sans rounded-md px-4 py-2">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-sans rounded-md px-4 py-2">
                {success}
              </div>
            )}
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 bg-white border border-champagne rounded-md font-sans text-sm text-espresso placeholder:text-mocha/50 focus:outline-none focus:border-rose-gold transition-colors tracking-[0.3em] text-center"
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                New Password
              </label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
              <PasswordStrength password={newPassword} />
            </div>
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                Confirm Password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="font-sans text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-gold text-cream py-3 font-sans text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-espresso disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Login / Register form */}
        {(mode === "login" || mode === "register") && (
          <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-sans rounded-md px-4 py-2">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-sans rounded-md px-4 py-2">
                {success}
              </div>
            )}

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in failed. Please try again.")}
                text={mode === "login" ? "signin_with" : "signup_with"}
                shape="rectangular"
                size="large"
                width="100%"
                theme="outline"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-champagne" />
              <span className="font-sans text-xs text-mocha/60 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-champagne" />
            </div>

            {mode === "register" && (
              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-champagne rounded-md font-sans text-sm text-espresso placeholder:text-mocha/50 focus:outline-none focus:border-rose-gold transition-colors"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-champagne rounded-md font-sans text-sm text-espresso placeholder:text-mocha/50 focus:outline-none focus:border-rose-gold transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Min 8 characters" : "Your password"}
                minLength={mode === "register" ? 8 : 1}
              />
              {mode === "register" && <PasswordStrength password={password} />}
            </div>

            {mode === "login" && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={goToForgot}
                  className="font-sans text-xs text-rose-gold hover:text-espresso transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === "register" && (
              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-mocha mb-1.5">
                  Phone <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-champagne rounded-md font-sans text-sm text-espresso placeholder:text-mocha/50 focus:outline-none focus:border-rose-gold transition-colors"
                  placeholder="Your phone number"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-gold text-cream py-3 font-sans text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-espresso disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              {submitting
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>

            <p className="text-center font-sans text-sm text-mocha">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                className="text-rose-gold hover:text-espresso font-medium transition-colors"
              >
                {mode === "login" ? "Register" : "Sign In"}
              </button>
            </p>
          </form>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center rounded-full text-mocha hover:text-espresso hover:bg-champagne/50 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
