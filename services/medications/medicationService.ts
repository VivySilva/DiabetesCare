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
