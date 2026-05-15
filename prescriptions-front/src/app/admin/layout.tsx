import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { RoleGate } from "@/components/role-gate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate role="admin">
      <div className="flex min-h-0 flex-1 flex-col">
        <AppHeader
          nav={
            <nav className="flex flex-wrap gap-x-3 gap-y-1">
              <Link className="app-nav-link hover:underline" href="/admin">
                Dashboard
              </Link>
              <Link className="app-nav-link hover:underline" href="/admin/users">
                Usuarios
              </Link>
            </nav>
          }
        />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-5 sm:py-6 lg:px-6">
          {children}
        </main>
      </div>
    </RoleGate>
  );
}
