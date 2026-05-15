"use client";

import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Paginated, Prescription, PrescriptionStatus } from "@/lib/auth-types";
import { apiFetch, apiFetchBlob } from "@/lib/fetcher";
import { PrescriptionStatusBadge } from "@/components/prescription-status-badge";
import { PRESCRIPTION_STATUS_FILTER_LABEL } from "@/lib/filter-labels";

const STATUSES: (PrescriptionStatus | "")[] = ["", "pending", "consumed", "expired"];

export default function PatientPrescriptionsPage() {
  const [filters, setFilters] = useQueryStates(
    {
      status: parseAsString,
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(20),
    },
    { history: "replace", shallow: false },
  );

  const [data, setData] = useState<Paginated<Prescription> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = (() => {
    const p = new URLSearchParams();
    if (filters.status) p.set("status", filters.status);
    p.set("page", String(filters.page));
    p.set("limit", String(filters.limit));
    return `?${p.toString()}`;
  })();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<Paginated<Prescription>>(
        `/me/prescriptions${queryString}`,
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

  async function downloadPdf(id: number, code: string) {
    try {
      const blob = await apiFetchBlob(`/prescriptions/${id}/pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${code}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF descargado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al descargar PDF");
    }
  }

  async function consume(id: number) {
    try {
      await apiFetch(`/prescriptions/${id}/consume`, { method: "PUT" });
      toast.success("Marcada como consumida");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo actualizar");
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="app-page-title">Mis prescripciones</h1>

      <div className="app-panel flex min-w-0 flex-wrap gap-4">
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          Estado
          <select
            value={filters.status ?? ""}
            onChange={(e) =>
              void setFilters({ status: e.target.value || null, page: 1 })
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
      </div>

      {loading && <p className="app-muted">Cargando…</p>}
      {error && (
        <div className="app-error">
          <p>{error}</p>
          <button type="button" className="app-link mt-2" onClick={() => void load()}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && data && data.data.length === 0 && (
        <div className="app-empty">No tienes prescripciones.</div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-1">
            {data.data.map((rx) => (
              <article
                key={rx.id}
                className="app-card flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-mono text-sm">{rx.code}</p>
                  <p className="text-lg font-medium">
                    Dr. {rx.author.user.name}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm app-muted">
                    <span>{new Date(rx.createdAt).toLocaleString()}</span>
                    <PrescriptionStatusBadge status={rx.status} />
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link
                    href={`/patient/prescriptions/${rx.id}`}
                    className="app-btn-secondary w-full justify-center sm:w-auto"
                  >
                    Ver detalle
                  </Link>
                  <button
                    type="button"
                    className="app-btn-secondary w-full justify-center sm:w-auto"
                    onClick={() => void downloadPdf(rx.id, rx.code)}
                  >
                    Descargar PDF
                  </button>
                  {rx.status === "pending" && (
                    <button
                      type="button"
                      className="app-btn-primary w-full justify-center sm:w-auto"
                      onClick={() => void consume(rx.id)}
                    >
                      Marcar consumida
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <span className="app-muted">
              Página {data.page} de {totalPages} — {data.total} en total
            </span>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <button
                type="button"
                disabled={data.page <= 1}
                className="app-btn-secondary-sm w-full sm:w-auto"
                onClick={() =>
                  void setFilters({ page: Math.max(1, (filters.page ?? 1) - 1) })
                }
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={data.page >= totalPages}
                className="app-btn-secondary-sm w-full sm:w-auto"
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
