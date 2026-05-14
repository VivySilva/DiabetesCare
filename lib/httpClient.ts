const API_URL = "/api";

/**
 * Base request function for the API.
 * 
 * Função base para realizar requisições HTTP para a API interna do sistema.
 * 
 * @param {string} endpoint - O endpoint da API (ex: "/auth/login").
 * @param {RequestInit} options - Opções adicionais da requisição (método, corpo, etc).
 * @param {string} [token] - Token JWT opcional para autenticação via Bearer.
 * @returns {Promise<any>} Os dados da resposta processados em JSON.
 * @throws {Error} Lança um erro se a resposta não for bem-sucedida.
 */
async function request(endpoint: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    console.log(`Sending request to ${endpoint} with token preview: ${token.substring(0, 10)}...`);
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.log(`Sending request to ${endpoint} WITHOUT token`);
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

/**
 * Standardized HTTP client for internal API calls.
 * 
 * Cliente HTTP padronizado para realizar chamadas para a API do DiabetesCare.
 */
export const httpClient = {
  /** Realiza uma requisição GET. */
  get: (endpoint: string, token?: string) => request(endpoint, { method: "GET" }, token),
  /** Realiza uma requisição POST com corpo JSON. */
  post: (endpoint: string, body: any, token?: string) => request(endpoint, { method: "POST", body: JSON.stringify(body) }, token),
  /** Realiza uma requisição PUT com corpo JSON. */
  put: (endpoint: string, body: any, token?: string) => request(endpoint, { method: "PUT", body: JSON.stringify(body) }, token),
  /** Realiza uma requisição PATCH com corpo JSON. */
  patch: (endpoint: string, body: any, token?: string) => request(endpoint, { method: "PATCH", body: JSON.stringify(body) }, token),
  /** Realiza uma requisição DELETE. */
  delete: (endpoint: string, token?: string) => request(endpoint, { method: "DELETE" }, token),
};
