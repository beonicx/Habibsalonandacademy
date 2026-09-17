"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);

    fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token invalid");
        return res.json();
      })
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem("auth_user", JSON.stringify(freshUser));
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clearAuth]);

  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = { ...options.headers };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
      }

      const res = await fetch(url.startsWith("http") ? url : `${API_BASE}${url}`, {
        ...options,
        headers,
      });

      if (res.status === 401 || res.status === 403) {
        clearAuth();
        throw new Error("Session expired. Please log in again.");
      }

      return res;
    },
    [token, clearAuth]
  );

  async function login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem("auth_token", data.accessToken);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    return data;
  }

  async function sendRegistrationOtp(name, email, password, phone) {
    const res = await fetch(`${API_BASE}/auth/send-registration-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send OTP");
    return data;
  }

  async function verifyRegistrationOtp(email, otp) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem("auth_token", data.accessToken);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    return data;
  }

  async function googleLogin(credential) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Google login failed");
    setUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem("auth_token", data.accessToken);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    return data;
  }

  function logout() {
    clearAuth();
  }

  async function updateProfile(updates) {
    const res = await authFetch("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Update failed");
    setUser(data);
    localStorage.setItem("auth_user", JSON.stringify(data));
    return data;
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, sendRegistrationOtp, verifyRegistrationOtp, googleLogin, logout, updateProfile, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
