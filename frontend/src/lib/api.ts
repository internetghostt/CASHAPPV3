//export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost/backend/api";
export const API_BASE = "https://devv.mugcafee.com/backend/api"; //add yur website dir to backend
function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const res = await fetch(`${API_BASE}${path}`, { headers: buildHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<TResponse, TBody extends Record<string, unknown>>(path: string, body: TBody): Promise<TResponse> {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers: buildHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPut<TResponse, TBody extends Record<string, unknown>>(path: string, body: TBody): Promise<TResponse> {
  const res = await fetch(`${API_BASE}${path}`, { method: "PUT", headers: buildHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPatch<TResponse, TBody extends Record<string, unknown>>(path: string, body: TBody): Promise<TResponse> {
  const res = await fetch(`${API_BASE}${path}`, { method: "PATCH", headers: buildHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}