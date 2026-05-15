export function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  return url.replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
