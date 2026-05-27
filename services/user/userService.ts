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
 * Funciona tanto para pacientes quanto para profissionais de saúde —
 * campos não enviados são ignorados no servidor (não sobrescrevem com undefined).
 *
 * @param {Object} data - Os novos dados do perfil.
 * @param {string} [data.name]           - Nome completo.
 * @param {string} [data.email]          - E-mail.
 * @param {string} [data.birth_date]     - Data de nascimento no formato YYYY-MM-DD (paciente).
 * @param {string} [data.gender]         - Gênero (paciente).
 * @param {string} [data.diabetes_type]  - Tipo de diabetes (paciente).
 * @param {string} [data.phone]          - Telefone.
 * @param {string} [data.avatar_url]     - URL da foto de perfil.
 * @param {string} [data.password]       - Nova senha (será hasheada no servidor).
 * @param {string} [data.cpf]            - CPF (profissional).
 * @param {string} [data.specialty]      - Especialidade (profissional).
 * @param {string} [data.crm]            - Número de registro CRM/CRN (profissional).
 * @param {string} [data.crm_uf]         - UF do registro (profissional).
 * @param {string} [data.education]      - Formação/instituição (profissional).
 * @param {string} [data.clinic_address] - Endereço do consultório (profissional).
 * @param {string | null} token          - Token de autenticação JWT.
 * @returns {Promise<any>} A resposta da API confirmando a atualização.
 */
export async function updateUserProfile(data: Record<string, any>, token: string | null) {
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");

  // Remove campos undefined do objeto antes de enviar
  const payload = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );

  return httpClient.put("/user/me", payload, token);
}

/**
 * Exclui permanentemente a conta de usuário atual.
 * 
 * @param {string | null} token - Token de autenticação JWT.
 * @returns {Promise<any>} A confirmação de sucesso de exclusão.
 */
export async function deleteUserProfile(token: string | null) {
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");
  return httpClient.delete("/user/me", token);
}
