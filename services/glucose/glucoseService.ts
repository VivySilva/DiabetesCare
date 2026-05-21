import { httpClient } from "@/lib/httpClient";

/**
 * Register a glucose reading.
 * 
 * Registra uma nova medição de glicose, incluindo informações sobre insulina e sintomas.
 * 
 * @param {Object} data - Os dados da medição.
 * @param {number} data.glucose_value - Valor da glicemia.
 * @param {string} data.period - Período do dia (ex: Jejum, Pós-almoço).
 * @param {boolean} data.took_insulin - Indica se tomou insulina.
 * @param {string} [data.insulin_type] - Tipo de insulina utilizada.
 * @param {number} [data.insulin_amount] - Quantidade de insulina em unidades.
 * @param {string} [data.injection_site] - Local da aplicação da insulina.
 * @param {string[]} [data.symptoms] - Lista de sintomas apresentados.
 * @param {number} [data.symptom_intensity] - Intensidade dos sintomas (escala numérica).
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} A resposta da API confirmando o registro.
 */
export async function registerGlucose(data: {
  glucose_value: number;
  period: string;
  took_insulin: boolean;
  insulin_type?: string;
  insulin_amount?: number;
  injection_site?: string;
  symptoms?: string[];
  symptom_intensity?: number;
}, token: string) {
  return httpClient.post("/glucose", data, token);
}

/**
 * Get glucose records.
 * 
 * Recupera o histórico de registros de glicose do usuário.
 * 
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} A resposta da API contendo a lista de registros.
 */
export async function getGlucoseRecords(token: string) {
  return httpClient.get("/glucose", token);
}

/**
 * Delete a glucose record.
 * 
 * Remove um registro de medição de glicose pelo ID.
 * 
 * @param {string} id - ID do registro de glicose a ser removido.
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} A resposta da API confirmando a remoção.
 */
export async function deleteGlucoseRecord(id: string, token: string) {
  return httpClient.delete(`/glucose/${id}`, token);
}

/**
 * Update a glucose record.
 * 
 * Atualiza um registro de medição de glicose existente.
 * 
 * @param {string} id - ID do registro de glicose a ser atualizado.
 * @param {Object} data - Os dados atualizados da medição.
 * @param {number} data.glucose_value - Valor da glicemia.
 * @param {string} data.period - Período do dia (ex: Jejum, Pós-almoço).
 * @param {boolean} data.took_insulin - Indica se tomou insulina.
 * @param {string} [data.insulin_type] - Tipo de insulina utilizada.
 * @param {number} [data.insulin_amount] - Quantidade de insulina em unidades.
 * @param {string} [data.injection_site] - Local da aplicação da insulina.
 * @param {string[]} [data.symptoms] - Lista de sintomas apresentados.
 * @param {number} [data.symptom_intensity] - Intensidade dos sintomas (escala numérica).
 * @param {string} token - Token de autenticação JWT.
 * @returns {Promise<any>} A resposta da API contendo o registro atualizado.
 */
export async function updateGlucoseRecord(
  id: string,
  data: {
    glucose_value: number;
    period: string;
    took_insulin: boolean;
    insulin_type?: string;
    insulin_amount?: number;
    injection_site?: string;
    symptoms?: string[];
    symptom_intensity?: number;
  },
  token: string
) {
  return httpClient.put(`/glucose/${id}`, data, token);
}
