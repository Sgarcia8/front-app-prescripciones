"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { homePathForRole } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (accessToken && user) {
      router.replace(homePathForRole(user.role));
    }
  }, [hasHydrated, accessToken, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await loginWithPassword(email, password);
      toast.success("Sesión iniciada");
      router.replace(homePathForRole(user.role));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="app-login-card">
        <h1 className="mb-6 text-center text-xl font-semibold text-title dark:text-slate-50">
          Iniciar sesión
        </h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="app-muted">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="app-muted">Contraseña</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="app-input"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary mt-2 w-full"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
