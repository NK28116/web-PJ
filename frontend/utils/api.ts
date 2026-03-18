const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-611370943102.us-east1.run.app';
const AUTH_TOKEN_KEY = 'auth_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_URL}${path}`;
  console.log(`[API Request] GET ${url}`);
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const url = `${API_URL}${path}`;
  console.log(`[API Request] POST ${url}`, body);
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const url = `${API_URL}${path}`;
  console.log(`[API Request] PUT ${url}`, body);
  const res = await fetch(url, {
    method: 'PUT',
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiDelete<T = void>(path: string): Promise<T> {
  const url = `${API_URL}${path}`;
  console.log(`[API Request] DELETE ${url}`);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}
