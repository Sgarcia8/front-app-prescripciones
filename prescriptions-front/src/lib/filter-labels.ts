import type { PrescriptionStatus } from "@/lib/auth-types";

export const PRESCRIPTION_STATUS_FILTER_LABEL: Record<PrescriptionStatus, string> =
  {
    pending: "Pendiente",
    consumed: "Consumida",
    expired: "Vencida",
  };

export const ORDER_OPTIONS = [
  { value: "createdAt.desc", label: "Fecha: más recientes primero" },
  { value: "createdAt.asc", label: "Fecha: más antiguas primero" },
  { value: "id.desc", label: "ID: mayor a menor" },
  { value: "id.asc", label: "ID: menor a mayor" },
] as const;
