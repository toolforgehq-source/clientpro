"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api, User, Usage } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  usage: Usage | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    company_name?: string;
  }) => Promise<string | null>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<string | null>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setUsage(null);
      setLoading(false);
      return;
    }

    const { data, error } = await api.auth.me();
    if (error || !data) {
      localStorage.removeItem("token");
      setUser(null);
      setUsage(null);
    } else {
      setUser(data.user);
      setUsage(data.usage);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await api.auth.login({ email, password });
    if (error || !data) return error || "Login failed";
    localStorage.setItem("token", data.token);
    setUser(data.user);
    await refreshUser();
    return null;
  };

  const register = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    company_name?: string;
  }): Promise<string | null> => {
    const { data: result, error } = await api.auth.register(data);
    if (error || !result) return error || "Registration failed";
    localStorage.setItem("token", result.token);
    setUser(result.user);
    await refreshUser();
    return null;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setUsage(null);
    window.location.href = "/login";
  };

  const updateProfile = async (data: Partial<User>): Promise<string | null> => {
    const { data: result, error } = await api.auth.updateProfile(data);
    if (error || !result) return error || "Update failed";
    setUser(result.user);
    return null;
  };

  return (
    <AuthContext.Provider
      value={{ user, usage, loading, login, register, logout, updateProfile, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
