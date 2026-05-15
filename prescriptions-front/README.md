# Prescripciones — Frontend

Aplicación web para médicos, pacientes y administradores sobre el flujo de prescripciones digitales. Consume la API REST del backend NestJS.

## URL Despliegue

> **App prescripciones** https://front-app-prescripciones.onrender.com/login

## Stack

| Tecnología | Uso |
|------------|-----|
| [Next.js](https://nextjs.org) 16 (App Router) | Framework React, rutas y SSR/SSG |
| [React](https://react.dev) 19 | UI |
| [TypeScript](https://www.typescriptlang.org) | Tipado |
| [Tailwind CSS](https://tailwindcss.com) 4 | Estilos |
| [ESLint](https://eslint.org) + `eslint-config-next` | Lint |
| [Zustand](https://github.com/pmndrs/zustand) | Estado global (sesión / auth) |
| [Sonner](https://sonner.emilkowal.ski/) | Toasts |
| [Recharts](https://recharts.org) | Gráficos (panel admin) |
| [nuqs](https://nuqs.47ng.com/) | Estado en query string |
| [Vitest](https://vitest.dev) + Testing Library | Tests |

## Requisitos

- **Node.js** (recomendado alinear con el backend, ≥ 20)
- **npm**
- Backend en ejecución (ver README del API) y URL configurada en variable de entorno

## Instalación

```bash
npm install
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base del API (sin barra final). Por defecto en código: `http://localhost:3001`. Debe coincidir con el puerto donde corre Nest (`PORT`). |

Ejemplo local si Next usa el puerto 3000 y el API el 3001:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo ([http://localhost:3000](http://localhost:3000)) |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

## Rutas de la aplicación (App Router)

Las páginas viven bajo `src/app/`.

| Ruta | Descripción |
|------|-------------|
| `/` | Redirección según sesión: sin login → `/login`; con login → home por rol (`homePathForRole` en `src/lib/auth.ts`) |
| `/login` | Inicio de sesión |

### Administrador (`admin`)

| Ruta | Descripción |
|------|-------------|
| `/admin` | Panel: métricas y vista general |
| `/admin/users` | Gestión de usuarios |

### Médico (`doctor`)

| Ruta | Descripción |
|------|-------------|
| `/doctor/prescriptions` | Listado de prescripciones |
| `/doctor/prescriptions/new` | Alta de prescripción |
| `/doctor/prescriptions/[id]` | Detalle |

### Paciente (`patient`)

| Ruta | Descripción |
|------|-------------|
| `/patient/prescriptions` | Mis recetas |
| `/patient/prescriptions/[id]` | Detalle, consumo y descarga PDF según API |

> La aplicación no usa `middleware.ts` de Next: el control de acceso por rol se basa en el store de auth y redirecciones en layouts/componentes. Las rutas por carpeta están pensadas para cada perfil.

## Roles

Tras el login, el backend devuelve el rol (`admin`, `doctor`, `patient`). El front redirige:

- **admin** → `/admin`
- **doctor** → `/doctor/prescriptions`
- **patient** → `/patient/prescriptions`

## Funcionalidad por rol (resumen)

- **Administrador**: métricas y listados globales; creación/listado de usuarios vía API.
- **Médico**: crear prescripciones para pacientes; listar y ver detalle de sus recetas.
- **Paciente**: ver sus prescripciones; marcar como consumidas y obtener PDF cuando el API lo permita.

## Paquetes destacados

- **next / react / react-dom**: núcleo de la app.
- **zustand**: tokens y usuario actual (`src/store/auth-store`).
- **recharts**: visualización en admin.
- **sonner**: feedback de operaciones.
- **nuqs**: sincronizar filtros/paginación con la URL donde aplica.

Para detalle de endpoints, esquemas y prueba de llamadas, usar **Swagger** del backend (`/api`; ver README del repositorio del API).
