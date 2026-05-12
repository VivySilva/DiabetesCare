import { NextRequest } from "next/server";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";
import { ReportService } from "@/services/reports/report-service";
import { DiabeticaService } from "@/services/reports/diabetica-service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "7";
  const periodDays = parseInt(period);

  try {
    // 1. Agrega dados clínicos
    const summary = await ReportService.getSummary(user.id, periodDays);

    // 2. Busca insights da IA Diabetica
    const aiTips = await DiabeticaService.getAITips(summary);

    return successResponse({
      summary,
      aiTips,
      generatedAt: new Date().toISOString(),
      patientName: user.name
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return errorResponse("Falha ao processar os dados do relatório.", 500);
  }
}
