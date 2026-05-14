import { httpClient } from "@/lib/httpClient";

/**
 * Get all forum topics.
 * 
 * Recupera a lista de todos os tópicos do fórum.
 * 
 * @returns {Promise<any>} A resposta da API contendo os tópicos.
 */
export async function getForumTopics() {
  return httpClient.get("/forum");
}

/**
 * Get a specific forum topic by ID.
 * 
 * Busca os detalhes e respostas de um tópico específico do fórum.
 * 
 * @param {string} id - O identificador único do tópico.
 * @returns {Promise<any>} A resposta da API contendo os detalhes do tópico.
 */
export async function getForumTopicById(id: string) {
  return httpClient.get(`/forum/${id}`);
}

/**
 * Create a new forum topic.
 * 
 * Cria um novo tópico de discussão no fórum.
 * 
 * @param {Object} data - Os dados do tópico.
 * @param {string} data.title - O título do tópico.
 * @param {string} [data.preview] - Um breve resumo ou conteúdo inicial.
 * @param {string} token - Token de autenticação JWT do autor.
 * @returns {Promise<any>} A resposta da API confirmando a criação.
 */
export async function createForumTopic(data: { title: string; preview?: string }, token: string) {
  return httpClient.post("/forum", data, token);
}

/**
 * Reply to a forum topic.
 * 
 * Adiciona uma resposta a um tópico existente no fórum.
 * 
 * @param {string} topicId - O ID do tópico que está sendo respondido.
 * @param {string} content - O conteúdo da resposta.
 * @param {string} token - Token de autenticação JWT do autor da resposta.
 * @returns {Promise<any>} A resposta da API confirmando a publicação.
 */
export async function replyToForumTopic(topicId: string, content: string, token: string) {
  return httpClient.post(`/forum/${topicId}/reply`, { content }, token);
}

/**
 * Like a forum topic.
 * 
 * Adiciona uma curtida (like) a um tópico do fórum.
 * 
 * @param {string} topicId - O ID do tópico.
 * @param {string} token - Token de autenticação JWT do usuário.
 * @returns {Promise<any>} A resposta da API confirmando a ação.
 */
export async function likeForumTopic(topicId: string, token: string) {
  return httpClient.post(`/forum/${topicId}/like`, {}, token);
}

/**
 * Unlike a forum topic.
 * 
 * Remove a curtida (like) de um tópico do fórum.
 * 
 * @param {string} topicId - O ID do tópico.
 * @param {string} token - Token de autenticação JWT do usuário.
 * @returns {Promise<any>} A resposta da API confirmando a remoção.
 */
export async function unlikeForumTopic(topicId: string, token: string) {
  return httpClient.delete(`/forum/${topicId}/like`, token);
}
