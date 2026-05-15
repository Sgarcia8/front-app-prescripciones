"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { homePathForRole } from "@/lib/auth";

export function AppHeader({
  title = "Prescripciones",
  nav,
}: {
  title?: string;
  nav?: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="app-header-shell">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href={user ? homePathForRole(user.role) : "/"}
            className="truncate font-semibold text-title dark:text-slate-50"
          >
            {title}
          </Link>
          {nav}
        </div>
        <div className="flex items-center gap-3 text-sm app-muted">
          <span className="hidden max-w-[12rem] truncate sm:inline">{user?.email}</span>
          <button
            type="button"
            className="app-btn-secondary px-2 py-1"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
