const API_BASE = "/api/v1";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };

  const anonToken = localStorage.getItem("sphereshop_cart_token");
  if (anonToken) {
    headers["X-Cart-Token"] = anonToken;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include"
  });

  const cartTokenHeader = res.headers.get("X-Cart-Token");
  if (cartTokenHeader) {
    localStorage.setItem("sphereshop_cart_token", cartTokenHeader);
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errorMsg = data?.error?.message || `Request failed with status ${res.status}`;
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export function formatRWF(amount: number): string {
  const rounded = Math.floor(amount || 0);
  return `${rounded.toLocaleString()} RWF`;
}
