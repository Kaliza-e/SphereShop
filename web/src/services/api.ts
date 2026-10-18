const API_BASE = "/api/v1";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
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
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await res.text();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errorMsg =
      (typeof data === "object" && data?.error?.message) ||
      (typeof data === "object" && data?.message) ||
      `Request failed with status ${res.status}`;
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
