import { httpClient } from "@/lib/httpClient";

/**
 * Get the public profile of a user (professional) by their ID.
 *
 * Busca o perfil público de um profissional. Não requer token.
 *
 * @param {string} userId - ID do usuário.
 * @returns {Promise<any>} Dados públicos do perfil.
 */
export async function getPublicProfile(userId: string) {
  return httpClient.get(`/user/${userId}`);
}

/**
 * List public professionals for the homepage and directory.
 *
 * Lista profissionais de saúde com dados públicos. Não requer token.
 *
 * @param {number} [page=1] - Número da página.
 * @param {number} [limit=8] - Itens por página.
 * @returns {Promise<any>} Lista paginada de profissionais.
 */
export async function listProfessionals(page: number = 1, limit: number = 8) {
  return httpClient.get(`/user/professionals?page=${page}&limit=${limit}`);
}
