import supabase from "@/config/supabase";

/**
 * Interface representing the clinical report summary data.
 */
export interface ReportSummary {
  period: string;
  glucose_average: number;
  estimated_a1c: number;
  time_in_range: number; // Porcentagem
  variability: number;   // Desvio Padrão
  total_records: number;
  hypoglycemia_events: number;
  hyperglycemia_events: number;
  medication_adherence: number;
}

/**
 * ReportService - Clinical Data Aggregation Engine.
 * 
 * Este serviço consolida informações de múltiplos módulos para gerar resumos estatísticos.
 */
export class ReportService {
  /**
   * Aggregates and processes user data for a specific period.
   * 
   * @param {string} userId - ID único do usuário.
   * @param {number} periodDays - Janela de tempo em dias para análise.
   * @returns {Promise<ReportSummary>} Resumo estatístico contendo médias, TIR e variabilidade.
   * @throws {Error} Falha na busca dos dados no banco.
   */
  static async getSummary(userId: string, periodDays: number): Promise<ReportSummary> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const { data: glucoseRecords, error: glucoseError } = await supabase
      .from("glucose_records")
      .select("glucose_value, created_at")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString());

    if (glucoseError) throw glucoseError;

    const { data: medicationRecords, error: medError } = await supabase
      .from("medication_records")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString());

    if (medError) throw medError;

    const values = glucoseRecords.map(r => r.glucose_value);
    const total = values.length;

    const average = total > 0 ? values.reduce((a, b) => a + b, 0) / total : 0;
    const estimatedA1c = total > 0 ? (average + 46.7) / 28.7 : 0;

    const inRange = values.filter(v => v >= 70 && v <= 180).length;
    const tir = total > 0 ? (inRange / total) * 100 : 0;

    const hypos = values.filter(v => v < 70).length;
    const hypers = values.filter(v => v > 180).length;

    const variance = total > 0
      ? values.reduce((a, b) => a + Math.pow(b - average, 2), 0) / total
      : 0;
    const stdDev = Math.sqrt(variance);

    return {
      period: `${periodDays} dias`,
      glucose_average: Math.round(average),
      estimated_a1c: Number(estimatedA1c.toFixed(1)),
      time_in_range: Math.round(tir),
      variability: Math.round(stdDev),
      total_records: total,
      hypoglycemia_events: hypos,
      hyperglycemia_events: hypers,
      medication_adherence: 100,
    };
  }
}
