export type Role = "admin" | "doctor" | "patient";

export type PrescriptionStatus = "pending" | "consumed" | "expired";

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  doctor?: { id: number; speciality?: string | null };
  patient?: { id: number; birthDate?: string | null };
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface PrescriptionItem {
  id: number;
  name: string;
  dosage?: string | null;
  quantity?: number | null;
  instructions?: string | null;
}

export interface Prescription {
  id: number;
  code: string;
  status: PrescriptionStatus;
  notes?: string | null;
  createdAt: string;
  consumedAt?: string | null;
  patientId: number;
  authorId: number;
  items: PrescriptionItem[];
  Patient: {
    id: number;
    user: { id: number; email: string; name: string };
  };
  author: {
    id: number;
    user: { id: number; email: string; name: string };
  };
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminMetrics {
  totals: {
    doctors: number;
    patients: number;
    prescriptions: number;
  };
  byStatus: Record<string, number>;
  byDay: { date: string; count: number }[];
  topDoctors: { doctorId: number; count: number; name?: string }[];
}
