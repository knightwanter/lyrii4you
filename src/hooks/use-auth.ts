"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { User } from "@/types";
import { ApiError, api } from "@/lib/api";
import {
  getToken,
  setToken,
  setStoredUser,
  getStoredUser,
  getStoredUserSyncedAt,
  clearAuth,
} from "@/lib/auth";

const USER_CACHE_TTL_MS = 5 * 60 * 1000;
let inFlightRefresh: Promise<{ user: User }> | null = null;
let inFlightServerLogout: Promise<void> | null = null;

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ message: string; devOtp?: string; delivery?: "email" | "debug" }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => ({ message: "" }),
  verifyOtp: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthEverywhere = useCallback((clearServer = true) => {
    clearAuth();
    if (clearServer && !inFlightServerLogout) {
      inFlightServerLogout = fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
        .catch(() => undefined)
        .then(() => undefined)
        .finally(() => {
          inFlightServerLogout = null;
        });
    }
    return inFlightServerLogout ?? Promise.resolve();
  }, []);

  const refreshUser = useCallback(async () => {
    const hadClientAuth = !!getToken() || !!getStoredUser();
    try {
      if (!inFlightRefresh) {
        inFlightRefresh = api.get<{ user: User }>("/auth/me").catch((err) => {
          throw err;
        }).finally(() => {
          inFlightRefresh = null;
        });
      }

      const data = await inFlightRefresh;
      if (!data) {
        throw new Error("Missing user");
      }
      setUser(data.user);
      setStoredUser(data.user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await clearAuthEverywhere(hadClientAuth);
      } else {
        clearAuth();
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthEverywhere]);

  useEffect(() => {
    const stored = getStoredUser();
    const lastSyncedAt = getStoredUserSyncedAt();
    const isFresh = !!lastSyncedAt && Date.now() - lastSyncedAt < USER_CACHE_TTL_MS;

    if (stored) {
      setUser(stored);
      setIsLoading(false);
      if (!isFresh) {
        void refreshUser();
      }
    } else {
      void refreshUser();
    }
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
    setToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    const data = await api.post<{ message: string; devOtp?: string; delivery?: "email" | "debug" }>(
      "/auth/signup",
      { username, email, password }
    );
    return data;
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const data = await api.post<{ token: string; user: User }>("/auth/verify-otp", { email, otp });
    setToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    // Fire-and-forget the server-side cookie clear; we still hard-redirect
    // immediately so the UI never lingers on an authenticated screen.
    void clearAuthEverywhere();
    setUser(null);
    window.location.href = "/";
  }, [clearAuthEverywhere]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    verifyOtp,
    logout,
    refreshUser,
  };
}
