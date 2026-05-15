"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Role } from "@/lib/auth-types";
import { homePathForRole } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";

export function RoleGate({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const waitingForRehydration = !hasHydrated && !(accessToken && user);

  useEffect(() => {
    if (waitingForRehydration) return;
    if (!accessToken || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      router.replace(homePathForRole(user.role));
    }
  }, [waitingForRehydration, accessToken, user, role, router]);

  if (waitingForRehydration) return null;

  if (!accessToken || !user || user.role !== role) return null;

  return <>{children}</>;
}
