import { useAuthStore } from "@/store/auth-store";
import { apiUrl } from "@/lib/api";
import type { RefreshResponse } from "@/lib/auth-types";

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  refreshInFlight = (async () => {
    const refresh = useAuthStore.getState().refreshToken;
    if (!refresh) {
      return null;
    }
    try {
      const res = await fetch(apiUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) {
        return null;
      }
      const data = (await res.json()) as RefreshResponse;
      useAuthStore.getState().setAccessToken(data.accessToken);
      return data.accessToken;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown>;
  skipAuth?: boolean;
};

function serializeBody(body: ApiFetchOptions["body"]): BodyInit | undefined {
  if (body == null) return undefined;
  if (typeof FormData !== "undefined" && body instanceof FormData) return body;
  if (typeof body === "string" || body instanceof Blob || body instanceof ArrayBuffer) {
    return body as BodyInit;
  }
  return JSON.stringify(body);
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth, body, headers: h, ...rest } = options;
  let headers = new Headers(h);

  const isJsonBody =
    body != null &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer);

  if (isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = path.startsWith("http") ? path : apiUrl(path);
  let res = await fetch(url, {
    ...rest,
    body: serializeBody(body),
    headers,
  });

  if (res.status === 401 && !skipAuth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers = new Headers(h);
      if (isJsonBody && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      headers.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(url, {
        ...rest,
        body: serializeBody(body),
        headers,
      });
    }
  }

  if (res.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") {
      const pathOnly = window.location.pathname;
      if (!pathOnly.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
  }

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    let msg: string;
    if (Array.isArray(errBody.message)) {
      msg = errBody.message.join(", ");
    } else if (typeof errBody.message === "string") {
      msg = errBody.message;
    } else {
      msg = `Request failed (${res.status})`;
    }
    throw new Error(msg);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function apiFetchBlob(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Blob> {
  const { skipAuth, body, headers: h, ...rest } = options;
  let headers = new Headers(h);

  if (!skipAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = path.startsWith("http") ? path : apiUrl(path);
  let res = await fetch(url, {
    ...rest,
    body: serializeBody(body),
    headers,
  });

  if (res.status === 401 && !skipAuth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers = new Headers(h);
      headers.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(url, {
        ...rest,
        body: serializeBody(body),
        headers,
      });
    }
  }

  if (res.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Download failed (${res.status})`);
  }

  return res.blob();
}
