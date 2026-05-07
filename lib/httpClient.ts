const API_URL = "/api";

async function request(endpoint: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.erro || errorData.error || errorData.message || `Erro na requisição: ${response.status}`);
  }

  return response.json();
}

export const httpClient = {
  get: (endpoint: string, token?: string) => request(endpoint, { method: "GET" }, token),
  post: (endpoint: string, body: any, token?: string) => request(endpoint, { method: "POST", body: JSON.stringify(body) }, token),
  put: (endpoint: string, body: any, token?: string) => request(endpoint, { method: "PUT", body: JSON.stringify(body) }, token),
  patch: (endpoint: string, body: any, token?: string) => request(endpoint, { method: "PATCH", body: JSON.stringify(body) }, token),
  delete: (endpoint: string, token?: string) => request(endpoint, { method: "DELETE" }, token),
};
