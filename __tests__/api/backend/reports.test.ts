import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";

process.env.SUPABASE_URL = "https://mock.supabase.co";
process.env.SUPABASE_KEY = "mock-key";
process.env.JWT_SECRET = "mock-jwt-secret-12345";

// 1. MOCKS (DUBLÊS)
vi.mock("@/lib/auth", () => ({
  verifyToken: vi.fn(),
  unauthorizedResponse: vi.fn(
    () =>
      new Response(JSON.stringify({ erro: "Não autorizado" }), { status: 401 }),
  ),
}));

vi.mock("@/config/env", () => ({
  env: {
    SUPABASE_URL: "https://mock.supabase.co",
    SUPABASE_KEY: "mock-key",
    JWT_SECRET: "mock-jwt-secret-12345",
  },
}));

// Dublê do serviço que calcula a média e a A1C
vi.mock("@/services/reports/report-service", () => ({
  ReportService: {
    getSummary: vi.fn(),
  },
}));

// Dublê do serviço que chama a IA Diabética para analisar os dados
vi.mock("@/services/reports/diabetica-service", () => ({
  DiabeticaService: {
    getAITips: vi.fn(),
  },
}));

vi.mock("@/lib/api-response", () => ({
  successResponse: vi.fn(
    (data) => new Response(JSON.stringify(data), { status: 200 }),
  ),
  errorResponse: vi.fn(
    (msg, status) => new Response(JSON.stringify({ error: msg }), { status }),
  ),
}));

// 2. IMPORTAÇÃO DA ROTA
// Lembre de ajustar caso sua pasta se chame 'reports' em vez de 'reports/generate'
import { GET } from "@/app/api/reports/generate/route";
import { verifyToken } from "@/lib/auth";
import { ReportService } from "@/services/reports/report-service";
import { DiabeticaService } from "@/services/reports/diabetica-service";

// 3. OS TESTES
describe("API de Relatórios (/api/reports/generate)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Deve retornar erro 401 se não estiver logado", async () => {
    vi.mocked(verifyToken).mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/reports/generate");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  test("Deve gerar relatório com sucesso usando o período padrão (7 dias)", async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: "user-123",
      role: "PATIENT",
      name: "Ana Paciente",
      email: "ana@teste.com",
    });

    // Simulando o retorno do serviço de cálculo clínico
    const mockSummary = { glucose_average: 105, estimated_a1c: 5.4 };
    vi.mocked(ReportService.getSummary).mockResolvedValue(mockSummary as any);

    // Simulando o retorno do texto da IA Diabética
    vi.mocked(DiabeticaService.getAITips).mockResolvedValue(
      "Mantenha o bom trabalho com sua dieta!",
    );

    // Faz a requisição SEM passar os dias na URL (deve cair no padrão = 7)
    const req = new NextRequest("http://localhost:3000/api/reports/generate");
    const res = await GET(req);

    expect(res.status).toBe(200);

    // Verifica se a sua lógica inteligente do Zod assumiu 7 dias corretamente
    expect(ReportService.getSummary).toHaveBeenCalledWith("user-123", 7);

    const json = await res.json();
    expect(json.patientName).toBe("Ana Paciente");
    expect(json.summary.glucose_average).toBe(105);
    expect(json.aiTips).toBe("Mantenha o bom trabalho com sua dieta!");
  });

  test("Deve aceitar o parâmetro de 30 dias na URL e gerar o relatório", async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: "user-123",
      role: "PATIENT",
      name: "Ana Paciente",
      email: "ana@teste.com",
    });
    vi.mocked(ReportService.getSummary).mockResolvedValue({
      glucose_average: 110,
    } as any);
    vi.mocked(DiabeticaService.getAITips).mockResolvedValue(
      "Dicas para os 30 dias analisados...",
    );

    // Passando period=30 diretamente na URL do Next.js
    const req = new NextRequest(
      "http://localhost:3000/api/reports/generate?period=30",
    );
    const res = await GET(req);

    expect(res.status).toBe(200);

    // Verifica se agora chamou o serviço calculando 30 dias de dados
    expect(ReportService.getSummary).toHaveBeenCalledWith("user-123", 30);
  });

  test("Deve retornar erro 500 se o serviço de dados ou a IA falharem", async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: "user-123",
      role: "PATIENT",
      name: "Ana",
      email: "ana@teste.com",
    });

    // Simulamos que deu pane ao buscar os dados
    vi.mocked(ReportService.getSummary).mockRejectedValue(
      new Error("Erro de conexão com o banco de dados"),
    );

    const req = new NextRequest("http://localhost:3000/api/reports/generate");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Falha ao processar os dados do relatório.");
  });
});
