"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Prescription } from "@/lib/auth-types";
import { apiFetch } from "@/lib/fetcher";
import { PrescriptionStatusBadge } from "@/components/prescription-status-badge";

export default function DoctorPrescriptionDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [rx, setRx] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) {
      setError("ID inválido");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<Prescription>(`/prescriptions/${id}`);
      setRx(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setRx(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (loading) {
    return <p className="app-muted">Cargando…</p>;
  }
  if (error || !rx) {
    return (
      <div className="app-error">
        <p>{error ?? "No encontrada"}</p>
        <Link href="/doctor/prescriptions" className="app-link mt-2 inline-block">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="app-page-title font-mono">{rx.code}</h1>
        <Link href="/doctor/prescriptions" className="app-link text-sm">
          Volver
        </Link>
      </div>
      <div className="app-card app-card-padding-lg grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs app-muted">Estado</p>
          <div className="mt-1">
            <PrescriptionStatusBadge status={rx.status} />
          </div>
        </div>
        <div>
          <p className="text-xs app-muted">Fecha</p>
          <p className="font-medium">{new Date(rx.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs app-muted">Paciente</p>
          <p className="font-medium">{rx.Patient.user.name}</p>
          <p className="text-sm app-muted">{rx.Patient.user.email}</p>
        </div>
        {rx.notes && (
          <div className="sm:col-span-2">
            <p className="text-xs app-muted">Notas</p>
            <p>{rx.notes}</p>
          </div>
        )}
      </div>
      <div>
        <h2 className="mb-3 font-semibold text-title dark:text-slate-100">
          Medicación
        </h2>
        <ul className="flex flex-col gap-3">
          {rx.items.map((it) => (
            <li key={it.id} className="app-inset">
              <p className="font-medium">{it.name}</p>
              {it.dosage && (
                <p className="text-sm app-muted">Dosis: {it.dosage}</p>
              )}
              {it.quantity != null && (
                <p className="text-sm app-muted">Cantidad: {it.quantity}</p>
              )}
              {it.instructions && (
                <p className="text-sm">{it.instructions}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
