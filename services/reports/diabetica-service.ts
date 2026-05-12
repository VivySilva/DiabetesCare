import { ReportSummary } from "./report-service";

/**
 * DiabeticaService - Camada de Integração com Inteligência Artificial
 * 
 * Este serviço é responsável por consumir a LLM Diabetica (Large Language Model) 
 * para transformar dados glicêmicos brutos em insights clínicos acionáveis e humanizados.
 */
export class DiabeticaService {
  /**
   * Gera dicas personalizadas baseadas no resumo clínico do paciente.
   * 
   * @param summary - Objeto contendo médias, variabilidade e eventos de hipo/hiper.
   * @returns Uma string contendo os conselhos gerados pela IA Diabetica.
   * 
   * @link Referência da LLM: https://github.com/waltonfuture/Diabetica
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
      // Simulação de chamada para a LLM Diabetica
      // No futuro, substituir pela URL real da API da Diabetica
      console.log("Chamando Diabetica LLM com prompt:", prompt);
      
      // Mock de resposta inteligente baseado nos dados
      if (summary.hypoglycemia_events > 3) {
        return "Notamos uma frequência alta de hipoglicemias. Revise sua dose de insulina basal com seu médico e certifique-se de carregar sempre um carboidrato de rápida absorção.";
      }
      
      if (summary.time_in_range < 70) {
        return "Seu tempo no alvo está abaixo do recomendado (70%). Tente monitorar a glicemia antes das refeições e ajustar a contagem de carboidratos.";
      }

      return "Seu controle está excelente! Mantenha a rotina de exercícios e o monitoramento constante para continuar com esses ótimos resultados.";
    } catch (error) {
      console.error("Erro ao chamar Diabetica LLM:", error);
      return "Não foi possível gerar dicas inteligentes no momento. Continue monitorando seus dados normalmente.";
    }
  }
}
