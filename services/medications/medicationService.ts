import { httpClient } from "@/lib/httpClient";

/**
 * Register a medication.
 * 
 * Registra um novo medicamento no cronograma do usuário, permitindo configurar lembretes.
 * 
 * @param {Object} data - Os dados do medicamento.
 * @param {string} data.category - Categoria do medicamento (ex: Oral, Injetável).
 * @param {string} data.medication_name - Nome do medicamento.
 * @param {string} data.time - Horário de administração.
 * @param {boolean} data.notify - Define se o usuário deve receber notificações.
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} A resposta da API confirmando o registro.
 */
export async function registerMedication(data: {
  category: string;
  medication_name: string;
  time: string;
  notify: boolean;
}, token: string) {
  return httpClient.post("/medications", data, token);
}

/**
 * Get medication records.
 * 
 * Recupera a lista de medicamentos cadastrados do usuário.
 * 
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} A resposta da API contendo a lista de medicamentos.
 */
export async function getMedications(token: string) {
  return httpClient.get("/medications", token);
}

/**
 * Delete a medication record.
 * 
 * Remove um registro de medicamento pelo ID.
 * 
 * @param {string} id - ID do registro de medicamento a ser removido.
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} A resposta da API confirmando a remoção.
 */
export async function deleteMedication(id: string, token: string) {
  return httpClient.delete(`/medications/${id}`, token);
}
