import { httpClient } from "@/lib/httpClient";

/**
 * Get current user profile.
 * 
 * Recupera os dados do perfil do usuário autenticado.
 * 
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} A resposta da API contendo os dados do perfil.
 */
export async function getUserProfile(token: string) {
  return httpClient.get("/user/me", token);
}

/**
 * Update user profile.
 * 
 * Atualiza os dados do perfil do usuário autenticado.
 * 
 * @param {Object} data - Os novos dados do perfil.
 * @param {string} [data.name] - Nome.
 * @param {string} [data.email] - E-mail.
 * @param {number} [data.age] - Idade.
 * @param {string} [data.gender] - Gênero.
 * @param {string} [data.diabetes_type] - Tipo de diabetes.
 * @param {string} [data.phone] - Telefone.
 * @param {string} [data.avatar_url] - Foto de perfil.
 * @param {string} [data.password] - Nova senha.
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} A resposta da API confirmando a atualização.
 */
export async function updateUserProfile(data: any, token: string) {
  return httpClient.put("/user/me", data, token);
}
