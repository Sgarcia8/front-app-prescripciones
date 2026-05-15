"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Paginated, Prescription } from "@/lib/auth-types";
import { apiFetch } from "@/lib/fetcher";

type PatientRow = {
  id: number;
  user: { id: number; email: string; name: string };
};

type ItemForm = {
  name: string;
  dosage: string;
  quantity: string;
  instructions: string;
};

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemForm[]>([
    { name: "", dosage: "", quantity: "", instructions: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoadingPatients(true);
      try {
        const res = await apiFetch<Paginated<PatientRow>>(
          "/patients?page=1&limit=100",
        );
        setPatients(res.data);
      } catch {
        toast.error("No se pudieron cargar los pacientes");
      } finally {
        setLoadingPatients(false);
      }
    })();
  }, []);

  function addItem() {
    setItems((i) => [
      ...i,
      { name: "", dosage: "", quantity: "", instructions: "" },
    ]);
  }

  function removeItem(idx: number) {
    setItems((i) => i.filter((_, j) => j !== idx));
  }

  function updateItem(idx: number, patch: Partial<ItemForm>) {
    setItems((rows) =>
      rows.map((row, j) => (j === idx ? { ...row, ...patch } : row)),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pid = Number(patientId);
    if (!Number.isFinite(pid) || pid < 1) {
      toast.error("Selecciona un paciente");
      return;
    }
    const payloadItems = items
      .map((it) => ({
        name: it.name.trim(),
        dosage: it.dosage.trim() || undefined,
        quantity:
          it.quantity.trim() === ""
            ? undefined
            : Math.max(0, Number.parseInt(it.quantity, 10)),
        instructions: it.instructions.trim() || undefined,
      }))
      .filter((it) => it.name.length > 0);

    if (payloadItems.length === 0) {
      toast.error("Añade al menos un medicamento con nombre");
      return;
    }
    setSubmitting(true);
    try {
      const created = await apiFetch<Prescription>("/prescriptions", {
        method: "POST",
        body: {
          patientId: pid,
          notes: notes.trim() || undefined,
          items: payloadItems,
        },
      });
      toast.success("Prescripción creada");
      router.push(`/doctor/prescriptions/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="app-page-title">Nueva prescripción</h1>
        <Link href="/doctor/prescriptions" className="app-link text-sm">
          Volver al listado
        </Link>
      </div>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="app-card app-card-padding-lg flex flex-col gap-6"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Paciente</span>
          {loadingPatients ? (
            <span className="app-muted">Cargando pacientes…</span>
          ) : (
            <select
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="app-input"
            >
              <option value="">Seleccionar…</option>
              {patients.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.user.name} ({p.user.email})
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Notas (opcional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="app-input"
          />
        </label>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Medicación</span>
            <button
              type="button"
              className="app-link text-sm"
              onClick={addItem}
            >
              + Añadir ítem
            </button>
          </div>
          {items.map((it, idx) => (
            <div
              key={idx}
              className="app-inset grid gap-2 sm:grid-cols-2"
            >
              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                Nombre *
                <input
                  required={idx === 0}
                  value={it.name}
                  onChange={(e) => updateItem(idx, { name: e.target.value })}
                  className="app-input py-1"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Dosis
                <input
                  value={it.dosage}
                  onChange={(e) => updateItem(idx, { dosage: e.target.value })}
                  className="app-input py-1"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Cantidad
                <input
                  type="number"
                  min={0}
                  value={it.quantity}
                  onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                  className="app-input py-1"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                Indicaciones
                <input
                  value={it.instructions}
                  onChange={(e) =>
                    updateItem(idx, { instructions: e.target.value })
                  }
                  className="app-input py-1"
                />
              </label>
              {items.length > 1 && (
                <button
                  type="button"
                  className="text-sm text-red-600 sm:col-span-2 dark:text-red-400 outline-1 outline-offset-2 outline-red-600 rounded-md hover:text-white"
                  onClick={() => removeItem(idx)}
                >
                  Eliminar ítem
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting || loadingPatients}
          className="app-btn-primary"
        >
          {submitting ? "Guardando…" : "Crear prescripción"}
        </button>
      </form>
    </div>
  );
}
