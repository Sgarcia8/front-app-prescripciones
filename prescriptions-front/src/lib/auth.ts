import type { Role } from "@/lib/auth-types";

export function homePathForRole(role: Role): string {
  switch (role) {
    case "doctor":
      return "/doctor/prescriptions";
    case "patient":
      return "/patient/prescriptions";
    case "admin":
      return "/admin";
    default:
      return "/login";
  }
}
