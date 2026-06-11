import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// 1. MOCKS CONFIGURADOS COM VI.HOISTED
const supabaseMocks = vi.hoisted(() => {
  const result = { data: [] as any, error: null as any };

  return {
    result,
    chain: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((onFulfilled) => onFulfilled(result)),
    },
  };
});

vi.mock("@/lib/auth", () => ({
  verifyToken: vi.fn(),
  unauthorizedResponse: vi.fn(
    () =>
      new Response(JSON.stringify({ erro: "Não autorizado" }), { status: 401 }),
  ),
}));

vi.mock("@/config/supabase", () => ({
  default: supabaseMocks.chain,
}));

vi.mock("@/lib/api-response", () => ({
  successResponse: vi.fn(
    (data) => new Response(JSON.stringify(data), { status: 200 }),
  ),
  errorResponse: vi.fn(
    (msg, status) => new Response(JSON.stringify({ error: msg }), { status }),
  ),
}));

// Importações oficiais (uma de cada arquivo, sem duplicar)
import { verifyToken } from "@/lib/auth";
import { GET } from "@/app/api/notifications/route";
import { PATCH } from "@/app/api/notifications/read-all/route";
import { POST } from "@/app/api/notifications/create/route";

describe("Testes do Módulo de Notificações", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMocks.result.data = [{ id: 1, title: "Nova Notificação" }];
    supabaseMocks.result.error = null;
  });

  // ==========================================
  // TESTES DA ROTA GET
  // ==========================================
  describe("GET /api/notifications", () => {
    test("Deve retornar erro 401 se o usuário não estiver autenticado", async () => {
      vi.mocked(verifyToken).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/notifications");
      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    test("Deve retornar 200 e a lista de notificações", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        name: "Teste",
        email: "t@t.com",
        role: "user",
      });
      const req = new NextRequest("http://localhost:3000/api/notifications");
      const response = await GET(req);
      expect(response.status).toBe(200);
    });

    test("Deve retornar erro 500 se o Supabase falhar", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        name: "Teste",
        email: "t@t.com",
        role: "user",
      });
      supabaseMocks.result.data = null;
      supabaseMocks.result.error = { message: "Erro de ligação" };
      const req = new NextRequest("http://localhost:3000/api/notifications");
      const response = await GET(req);
      expect(response.status).toBe(500);
    });
  });

  // ==========================================
  // TESTES DA ROTA PATCH
  // ==========================================
  describe("PATCH /api/notifications/read-all", () => {
    test("Deve retornar erro 401 se não estiver autenticado", async () => {
      vi.mocked(verifyToken).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/notifications", {
        method: "PATCH",
      });
      const response = await PATCH(req);
      expect(response.status).toBe(401);
    });

    test("Deve retornar 200 ao marcar como lidas", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        name: "Teste",
        email: "t@t.com",
        role: "user",
      });
      const req = new NextRequest("http://localhost:3000/api/notifications", {
        method: "PATCH",
      });
      const response = await PATCH(req);
      expect(response.status).toBe(200);
      const dados = await response.json();
      expect(dados.mensagem).toBe(
        "Todas as notificações foram marcadas como lidas.",
      );
    });
  });

  // ==========================================
  // TESTES DA ROTA POST
  // ==========================================
  describe("POST /api/notifications/create", () => {
    test("Deve retornar erro 401 se o usuário não estiver autenticado", async () => {
      vi.mocked(verifyToken).mockResolvedValue(null);
      const req = new NextRequest(
        "http://localhost:3000/api/notifications/create",
        { method: "POST" },
      );
      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    test("Deve retornar erro 400 se enviar dados incompletos (sem título/corpo)", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        name: "Teste",
        email: "t@t.com",
        role: "user",
      });
      const req = new NextRequest(
        "http://localhost:3000/api/notifications/create",
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );
      const response = await POST(req);
      expect(response.status).toBe(400);
    });

    test("Deve retornar status 200 e criar a notificação com sucesso", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        name: "Teste",
        email: "t@t.com",
        role: "user",
      });
      const corpoFalso = {
        title: "Medir Glicose",
        body: "Hora de verificar o sensor!",
      };
      const req = new NextRequest(
        "http://localhost:3000/api/notifications/create",
        {
          method: "POST",
          body: JSON.stringify(corpoFalso),
        },
      );
      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });
});
