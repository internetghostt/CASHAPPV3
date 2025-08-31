"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiPost, apiGet } from "@/lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  balance: number;
  account_number: string;
  is_admin: number;
  is_frozen: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isReady: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refresh = async () => {
    try {
      const me = await apiGet<{ user: User }>("/auth/me.php");
      setUser(me.user);
    } catch (_err) {
      // ignore
    }
  };

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (t) {
      setToken(t);
      (async () => {
        try {
          await refresh();
        } finally {
          setIsReady(true);
        }
      })();
    } else {
      setIsReady(true);
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await apiPost<{ token: string; user: User }, { identifier: string; password: string }>(
      "/auth/login.php",
      { identifier, password }
    );
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const res = await apiPost<{ token: string; user: User }, { name: string; email: string; phone: string; password: string }>(
      "/auth/register.php",
      { name, email, phone, password }
    );
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isReady, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}