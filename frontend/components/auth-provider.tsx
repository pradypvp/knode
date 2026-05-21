"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  apiGet,
  apiPost,
  clearToken,
  getToken,
  setToken,
} from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  credibilityScore: number;
  karmaBalance: number;
  department?: string | null;
  year?: number | null;
  bio?: string | null;
  careerGoal?: string | null;
  interests?: unknown;
  projects?: unknown;
  skills?: { skill: string; proficiency: number }[];
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const data = await apiGet<{ user: AuthUser }>("/users/me", t);
      setUser(data.user);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiPost<{ token: string }>("/auth/login", {
      email,
      password,
    });
    setToken(data.token);
    const me = await apiGet<{ user: AuthUser }>("/users/me", data.token);
    setUser(me.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const data = await apiPost<{ token: string }>("/auth/register", {
        email,
        password,
        name,
      });
      setToken(data.token);
      const me = await apiGet<{ user: AuthUser }>("/users/me", data.token);
      setUser(me.user);
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      refresh,
      login,
      register,
      logout,
    }),
    [user, ready, refresh, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
