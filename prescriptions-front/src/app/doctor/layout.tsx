import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { RoleGate } from "@/components/role-gate";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate role="doctor">
      <div className="flex min-h-0 flex-1 flex-col">
        <AppHeader
          nav={
            <nav className="flex flex-wrap gap-x-3 gap-y-1">
              <Link className="app-nav-link hover:underline" href="/doctor/prescriptions">
                Listado
              </Link>
              <Link className="app-nav-link hover:underline" href="/doctor/prescriptions/new">
                Nueva prescripción
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
