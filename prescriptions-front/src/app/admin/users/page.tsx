"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/lib/auth-types";
import { apiFetch } from "@/lib/fetcher";

type CreateRole = "doctor" | "patient";

export default function AdminUsersPage() {
  const [role, setRole] = useState<CreateRole>("doctor");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        email: email.trim(),
        password,
        name: name.trim(),
        role,
      };
      if (role === "doctor" && speciality.trim()) {
        body.speciality = speciality.trim();
      }
      if (role === "patient" && birthDate) {
        body.birthDate = `${birthDate}T00:00:00.000Z`;
      }

      const created = await apiFetch<UserProfile>("/users", {
        method: "POST",
        body,
      });
      toast.success(
        `Usuario creado: ${created.name} (${created.role}) — ID ${created.id}`,
      );
      setEmail("");
      setName("");
      setPassword("");
      setSpeciality("");
      setBirthDate("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="app-page-title">Crear usuarios</h1>
        <p className="app-subtitle">
          Alta de doctores y pacientes.
        </p>
      </div>

      <div className="app-login-card mx-auto w-full min-w-0 max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2 text-sm">
            <span className="app-muted">Tipo de usuario</span>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  checked={role === "doctor"}
                  onChange={() => setRole("doctor")}
                />
                Doctor
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  checked={role === "patient"}
                  onChange={() => setRole("patient")}
                />
                Paciente
              </label>
            </div>
          </fieldset>

          <label className="flex flex-col gap-1 text-sm">
            <span className="app-muted">Nombre</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="app-input"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="app-muted">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-input"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="app-muted">
              Contraseña (mín. 6 caracteres)
            </span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="app-input"
            />
          </label>

          {role === "doctor" ? (
            <label className="flex flex-col gap-1 text-sm">
              <span className="app-muted">
                Especialidad (opcional)
              </span>
              <input
                type="text"
                autoComplete="organization-title"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="app-input"
              />
            </label>
          ) : (
            <label className="flex flex-col gap-1 text-sm">
              <span className="app-muted">
                Fecha de nacimiento (opcional)
              </span>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="app-input"
              />
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary mt-2"
          >
            {loading ? "Creando…" : "Crear usuario"}
          </button>
        </form>
      </div>
    </div>
  );
}
