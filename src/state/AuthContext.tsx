"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { id: string; email: string; name?: string } | null;

type AuthContextValue = {
  user: User;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name?: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
    return;
  }

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("token", data.token);
  }

  async function register(payload: { name?: string; email: string; password: string }) {
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error("Register failed");
    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("token", data.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    document.cookie = "token=; Path=/; Max-Age=0";
  }

  const value = useMemo(() => ({ user, token, loading, login, register, logout, refresh }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}