"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { homePathForRole } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";

export function HomeRedirect() {
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
    router.replace(homePathForRole(user.role));
  }, [waitingForRehydration, accessToken, user, router]);

  return null;
}
