"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import type { Paginated, Prescription, PrescriptionStatus } from "@/lib/auth-types";
import { apiFetch } from "@/lib/fetcher";
import { PrescriptionStatusBadge } from "@/components/prescription-status-badge";
import {
  ORDER_OPTIONS,
  PRESCRIPTION_STATUS_FILTER_LABEL,
} from "@/lib/filter-labels";

const STATUSES: (PrescriptionStatus | "")[] = ["", "pending", "consumed", "expired"];

function buildPrescriptionsQuery(q: {
  status: string | null;
  from: string | null;
  to: string | null;
  page: number;
  limit: number;
  order: string | null;
}): string {
  const params = new URLSearchParams();
  if (q.status) params.set("status", q.status);
  if (q.from) {
    params.set("from", new Date(q.from + "T00:00:00").toISOString());
  }
  if (q.to) {
    params.set("to", new Date(q.to + "T23:59:59.999").toISOString());
  }
  params.set("page", String(q.page));
  params.set("limit", String(q.limit));
  params.set("order", q.order || "createdAt.desc");
  return `?${params.toString()}`;
}

export default function DoctorPrescriptionsPage() {
  const [filters, setFilters] = useQueryStates(
    {
      status: parseAsString,
      from: parseAsString,
      to: parseAsString,
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(20),
      order: parseAsString.withDefault("createdAt.desc"),
    },
    { history: "replace", shallow: false },
  );

  const [data, setData] = useState<Paginated<Prescription> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(
    () =>
      buildPrescriptionsQuery({
        status: filters.status,
        from: filters.from,
        to: filters.to,
        page: filters.page,
        limit: filters.limit,
        order: filters.order,
      }),
    [filters],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<Paginated<Prescription>>(
        `/prescriptions${queryString}`,
      );
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="app-page-title">Mis prescripciones</h1>
        <Link
          href="/doctor/prescriptions/new"
          className="app-btn-primary inline-flex w-full justify-center sm:w-fit"
        >
          Nueva prescripción
        </Link>
      </div>

      <div className="app-panel grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span>Estado</span>
          <select
            value={filters.status ?? ""}
            onChange={(e) =>
              void setFilters({
                status: e.target.value || null,
                page: 1,
              })
            }
            className="app-input w-full min-w-0"
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s === "" ? "Todos" : PRESCRIPTION_STATUS_FILTER_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span>Desde</span>
          <input
            type="date"
            value={filters.from ?? ""}
            onChange={(e) =>
              void setFilters({ from: e.target.value || null, page: 1 })
            }
            className="app-input w-full min-w-0"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span>Hasta</span>
          <input
            type="date"
            value={filters.to ?? ""}
            onChange={(e) =>
              void setFilters({ to: e.target.value || null, page: 1 })
            }
            className="app-input w-full min-w-0"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span>Orden</span>
          <select
            value={filters.order ?? "createdAt.desc"}
            onChange={(e) =>
              void setFilters({ order: e.target.value || null, page: 1 })
            }
            className="app-input w-full min-w-0"
          >
            {ORDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <p className="app-muted" aria-live="polite">
          Cargando…
        </p>
      )}
      {error && (
        <div className="app-error">
          <p>{error}</p>
          <button
            type="button"
            className="app-link mt-2 text-sm"
            onClick={() => void load()}
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && data && data.data.length === 0 && (
        <div className="app-empty">
          No hay prescripciones con estos filtros.
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="app-table-shell">
            <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
              <thead className="app-thead">
                <tr>
                  <th className="px-3 py-2 font-medium">Código</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-3 py-2 font-medium">Paciente</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {data.data.map((rx) => (
                  <tr key={rx.id} className="app-tr-hover">
                    <td className="px-3 py-2 font-mono text-xs">{rx.code}</td>
                    <td className="px-3 py-2">
                      <PrescriptionStatusBadge status={rx.status} />
                    </td>
                    <td className="px-3 py-2">{rx.Patient.user.name}</td>
                    <td className="px-3 py-2 app-muted">
                      {new Date(rx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/doctor/prescriptions/${rx.id}`}
                        className="app-link font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="app-muted">
              Página {data.page} de {totalPages} — {data.total} en total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={data.page <= 1}
                className="app-btn-secondary-sm"
                onClick={() =>
                  void setFilters({ page: Math.max(1, (filters.page ?? 1) - 1) })
                }
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={data.page >= totalPages}
                className="app-btn-secondary-sm"
                onClick={() =>
                  void setFilters({ page: (filters.page ?? 1) + 1 })
                }
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
