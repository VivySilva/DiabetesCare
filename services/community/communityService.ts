import { httpClient } from "@/lib/httpClient";

/**
 * Get all community posts.
 * 
 * Recupera a lista de todos os posts da comunidade.
 * 
 * @returns {Promise<any>} Lista de publicações.
 */
export async function getCommunityPosts() {
  return httpClient.get("/community");
}

/**
 * Get a specific community post by ID.
 * 
 * Busca os detalhes de um post específico da comunidade.
 * 
 * @param {string} id - ID da publicação.
 * @returns {Promise<any>} Detalhes da publicação.
 */
export async function getCommunityPostById(id: string) {
  return httpClient.get(`/community/${id}`);
}

/**
 * Create a new community post.
 * 
 * @param {Object} data - Dados da publicação.
 * @param {string} data.title - Título.
 * @param {string} [data.cover_image_url] - URL da capa.
 * @param {string} data.category - Categoria.
 * @param {string} data.content_html - Conteúdo HTML.
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} Resposta da API.
 */
export async function createCommunityPost(data: {
  title: string;
  cover_image_url?: string | null;
  category: string;
  content_html: string;
}, token: string) {
  return httpClient.post("/community", data, token);
}

/**
 * Update an existing community post.
 * 
 * @param {string} id - ID da publicação.
 * @param {Object} data - Dados para atualização.
 * @param {string} [data.title] - Novo título.
 * @param {string} [data.cover_image_url] - Nova capa.
 * @param {string} [data.category] - Nova categoria.
 * @param {string} [data.content_html] - Novo HTML.
 * @param {string} token - Token de autenticação.
 * @returns {Promise<any>} Resposta da API.
 */
export async function updateCommunityPost(id: string, data: {
  title?: string;
  cover_image_url?: string | null;
  category?: string;
  content_html?: string;
}, token: string) {
  return httpClient.put(`/community/${id}`, data, token);
}

/**
 * Delete a community post.
 * 
 * @param {string} id - ID da publicação.
 * @param {string} token - Token de autenticação.
 * @returns {Promise<any>} Resposta da API.
 */
export async function deleteCommunityPost(id: string, token: string) {
  return httpClient.delete(`/community/${id}`, token);
}
