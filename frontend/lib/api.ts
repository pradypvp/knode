function apiOrigin(): string {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env !== undefined && env.trim() !== "") {
    return env.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.INTERNAL_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:4000";
}

function apiUrl(path: string): string {
  const origin = apiOrigin();
  const suffix = `/api${path}`;
  if (origin === "") {
    return suffix;
  }
  return `${origin}${suffix}`;
}

function displayApiTarget(): string {
  if (typeof window !== "undefined" && apiOrigin() === "") {
    return `${window.location.origin} (proxied to backend — see next.config.ts)`;
  }
  return apiOrigin() || "http://127.0.0.1:4000";
}

const TOKEN_KEY = "knode_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function headers(token?: string | null, json = true): HeadersInit {
  const h: Record<string, string> = {};
  if (json) h["Content-Type"] = "application/json";
  const t = token ?? getToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseError(res: Response): Promise<ApiError> {
  let msg = res.statusText || `HTTP ${res.status}`;
  let details: unknown;
  try {
    const body = (await res.json()) as { error?: string; details?: unknown };
    if (body.error) msg = body.error;
    details = body.details;
  } catch {
    /* ignore */
  }
  return new ApiError(msg, res.status, details);
}

async function doFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "Network error";
    throw new ApiError(
      `Cannot reach the API (${displayApiTarget()}). ` +
        `From the project root run: docker compose up -d. Then in backend/: npx prisma migrate deploy && npm run dev (port 4000). ` +
        `Restart next dev after changing .env. (${reason})`,
      0
    );
  }
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  const res = await doFetch(apiUrl(path), {
    headers: headers(token, false),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiGetPublic<T>(path: string): Promise<T> {
  const res = await doFetch(apiUrl(path));
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await doFetch(apiUrl(path), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await doFetch(apiUrl(path), {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await doFetch(apiUrl(path), {
    method: "PATCH",
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export function getSocketBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env !== undefined && env.trim() !== "") {
    return env.replace(/\/$/, "");
  }
  return "http://127.0.0.1:4000";
}
