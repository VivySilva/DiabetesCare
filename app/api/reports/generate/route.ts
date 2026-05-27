import { NextRequest } from "next/server";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";
import { ReportService } from "@/services/reports/report-service";
import { DiabeticaService } from "@/services/reports/diabetica-service";
import { successResponse, errorResponse } from "@/lib/api-response";
import supabase from "@/config/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/reports/generate
 * 
 * Gera um relatório consolidado com dados clínicos e insights de IA.
 * 
 * @param {NextRequest} req - Objeto de requisição.
 * @param {Object} req.query - Parâmetros de busca na URL.
 * @param {string} [req.query.period=7] - Período em dias para análise (ex: 7, 15, 30).
 * @returns {Promise<Response>} Relatório completo ou erro (401, 500).
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "7";
  const periodDays = parseInt(period);

  try {
    const summary = await ReportService.getSummary(user.id, periodDays);
    const aiTips = await DiabeticaService.getAITips(summary);

    // Buscar dados atualizados do banco (o token do JWT não contém diabetes_type)
    const { data: dbUser } = await supabase
      .from("users")
      .select("name, diabetes_type")
      .eq("id", user.id)
      .single();

    return successResponse({
      summary,
      aiTips,
      generatedAt: new Date().toISOString(),
      patientName: dbUser?.name || user.name,
      diabetesType: dbUser?.diabetes_type || "Não informado"
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return errorResponse("Falha ao processar os dados do relatório.", 500);
  }
}
