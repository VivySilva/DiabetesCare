import { ReportSummary } from "./report-service";
import { generateDiabeticaResponse } from "@/lib/diabetica-client";

/**
 * DiabeticaService - AI Integration Layer.
 * 
 * Este serviço transforma dados glicêmicos em insights clínicos acionáveis.
 */
export class DiabeticaService {
  /**
   * Generates personalized tips based on the patient's clinical summary.
   * 
   * @param {Object} summary - Objeto contendo o resumo clínico.
   * @param {string} summary.period - Período analisado.
   * @param {number} summary.glucose_average - Média glicêmica.
   * @param {number} summary.estimated_a1c - A1c estimada.
   * @param {number} summary.time_in_range - Tempo no alvo.
   * @param {number} summary.hypoglycemia_events - Eventos de hipo.
   * @param {number} summary.hyperglycemia_events - Eventos de hiper.
   * @param {number} summary.variability - Variabilidade (DP).
   * @returns {Promise<string>} Conselhos gerados pela IA.
   */
  static async getAITips(summary: ReportSummary): Promise<string> {
    const prompt = `
      Atue como um especialista em endocrinologia e diabetes. 
      Analise os seguintes dados do paciente dos últimos ${summary.period}:
      - Média Glicêmica: ${summary.glucose_average} mg/dL
      - Hemoglobina Glicada Estimada: ${summary.estimated_a1c}%
      - Tempo no Alvo (TIR): ${summary.time_in_range}%
      - Eventos de Hipoglicemia: ${summary.hypoglycemia_events}
      - Eventos de Hiperglicemia: ${summary.hyperglycemia_events}
      - Variabilidade: ${summary.variability} mg/dL

      Com base nisso, forneça 3 dicas curtas e práticas para o paciente melhorar seu controle.
      Seja encorajador e profissional.
    `;

    try {
      const response = await generateDiabeticaResponse(prompt, [], 60000);
      return response || "A Diabetica não retornou dicas no momento.";
    } catch (error) {
      console.error("Erro ao chamar Diabetica LLM, usando fallback:", error);
      
      if (summary.hypoglycemia_events > 3) {
        return "Notamos uma frequência alta de hipoglicemias. Revise sua dose de insulina basal com seu médico e certifique-se de carregar sempre um carboidrato de rápida absorção.";
      }

      if (summary.time_in_range < 70) {
        return "Seu tempo no alvo está abaixo do recomendado (70%). Tente monitorar a glicemia antes das refeições e ajustar a contagem de carboidratos.";
      }

      return "Seu controle está excelente! Mantenha a rotina de exercícios e o monitoramento constante para continuar com esses ótimos resultados.";
    }
  }
}
