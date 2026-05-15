import type { PrescriptionStatus } from "@/lib/auth-types";

const STATUS_LABEL: Record<PrescriptionStatus, string> = {
  pending: "Pendiente",
  consumed: "Consumida",
  expired: "Vencida",
};

const STATUS_CLASS: Record<PrescriptionStatus, string> = {
  pending: "app-badge app-badge--pending",
  consumed: "app-badge app-badge--consumed",
  expired: "app-badge app-badge--expired",
};

export function PrescriptionStatusBadge({
  status,
  className,
}: {
  status: PrescriptionStatus;
  className?: string;
}) {
  return (
    <span className={[STATUS_CLASS[status], className].filter(Boolean).join(" ")}>
      {STATUS_LABEL[status]}
    </span>
  );
}
