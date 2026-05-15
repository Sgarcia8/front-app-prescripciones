import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LoginResponse, UserProfile } from "@/lib/auth-types";
import { apiUrl } from "@/lib/api";

/** Avoids `sessionStorage` during SSR so persist always registers `hydrate()`. */
function authPersistStorage(): Storage {
  if (typeof window === "undefined") {
    return {
      length: 0,
      clear: () => {},
      getItem: () => null,
      key: () => null,
      removeItem: () => {},
      setItem: () => {},
    };
  }
  return sessionStorage;
}

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  hasHydrated: boolean;
  setTokens: (access: string | null, refresh: string | null) => void;
  setAccessToken: (t: string | null) => void;
  setUser: (u: UserProfile | null) => void;
  loginWithPassword: (email: string, password: string) => Promise<UserProfile>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: false,
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      loginWithPassword: async (email, password) => {
        const res = await fetch(apiUrl("/auth/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            message?: string | string[];
          };
          const msg = Array.isArray(err.message)
            ? err.message.join(", ")
            : typeof err.message === "string"
              ? err.message
              : "Invalid credentials";
          throw new Error(msg);
        }
        const tokens = (await res.json()) as LoginResponse;
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });

        const me = await fetch(apiUrl("/auth/profile"), {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
        if (!me.ok) {
          get().logout();
          throw new Error("Failed to load profile");
        }
        const user = (await me.json()) as UserProfile;
        set({ user });
        return user;
      },
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
    }),
    {
      name: "prescriptions-auth",
      storage: createJSONStorage(() => authPersistStorage()),
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);
