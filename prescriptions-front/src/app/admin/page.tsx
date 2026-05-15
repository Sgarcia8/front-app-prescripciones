"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminMetrics } from "@/lib/auth-types";
import { apiFetch } from "@/lib/fetcher";

const AdminCharts = dynamic(
  () => import("@/components/admin-charts").then((m) => ({ default: m.AdminCharts })),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="app-skeleton h-64" />
        <div className="app-skeleton h-64" />
      </div>
    ),
  },
);

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => {
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    const from = new Date(to);
    from.setDate(from.getDate() - 29);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }, []);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("from", range.from.toISOString());
    p.set("to", range.to.toISOString());
    return `?${p.toString()}`;
  }, [range]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<AdminMetrics>(`/admin/metrics${query}`);
      setMetrics(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar métricas");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (loading) {
    return (
      <p className="app-muted" aria-live="polite">
        Cargando métricas (últimos 30 días)…
      </p>
    );
  }
  if (error || !metrics) {
    return (
      <div className="app-error">
        <p>{error ?? "Sin datos"}</p>
        <button
          type="button"
          className="app-link mt-2"
          onClick={() => void load()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="app-page-title">Dashboard admin</h1>
        <p className="app-subtitle">Rango: últimos 30 días</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="app-card">
          <p className="text-sm app-muted">Doctores</p>
          <p className="text-2xl font-semibold text-title dark:text-slate-50">
            {metrics.totals.doctors}
          </p>
        </div>
        <div className="app-card">
          <p className="text-sm app-muted">Pacientes</p>
          <p className="text-2xl font-semibold text-title dark:text-slate-50">
            {metrics.totals.patients}
          </p>
        </div>
        <div className="app-card">
          <p className="text-sm app-muted">Prescripciones (período)</p>
          <p className="text-2xl font-semibold text-title dark:text-slate-50">
            {metrics.totals.prescriptions}
          </p>
        </div>
      </div>

      <AdminCharts metrics={metrics} />
    </div>
  );
}
