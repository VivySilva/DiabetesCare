import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import React from "react";

// 1. MOCKS (DUBLÊS) COM VI.HOISTED
const mocks = vi.hoisted(() => {
  const state = {
    records: [] as any[],
    insertError: null as any,
    insertData: null as any,
  };
  return {
    state,
    chain: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      // Usado no GET (buscar histórico)
      order: vi.fn(() => Promise.resolve({ data: state.records, error: null })),
      // Usado no POST (salvar nova glicemia)
      insert: vi.fn().mockReturnThis(),
      single: vi.fn(() =>
        Promise.resolve({ data: state.insertData, error: state.insertError }),
      ),
    },
  };
});

vi.mock("@/config/supabase", () => ({ default: mocks.chain }));

vi.mock("@/lib/auth", () => ({
  verifyToken: vi.fn(),
  unauthorizedResponse: vi.fn(
    () =>
      new Response(JSON.stringify({ erro: "Não autorizado" }), { status: 401 }),
  ),
}));

// Simulador da validação Zod (glucoseSchema)
vi.mock("@/schemas/glucose", () => ({
  glucoseSchema: {
    safeParse: vi.fn((body) => {
      // Se não enviar o valor ou o período, a validação falha
      if (!body.glucose_value || !body.period) {
        return {
          success: false,
          error: { issues: [{ message: "Dados de glicemia incompletos." }] },
        };
      }
      return { success: true, data: body };
    }),
  },
}));

vi.mock("@/lib/api-response", () => ({
  successResponse: vi.fn(
    (data, status = 200) => new Response(JSON.stringify(data), { status }),
  ),
  errorResponse: vi.fn(
    (msg, status) => new Response(JSON.stringify({ error: msg }), { status }),
  ),
}));

// 2. IMPORTAÇÕES DA ROTA
// ATENÇÃO: Ajuste o caminho se sua rota de glicose estiver em outra pasta!
import { GET, POST } from "@/app/api/glucose/route";
import { verifyToken } from "@/lib/auth";

// 3. OS TESTES
describe("API de Glicemia (/api/glucose)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.records = [];
    mocks.state.insertError = null;
    mocks.state.insertData = { id: 1, glucose_value: 100, period: "Jejum" };
  });

  // ==========================================
  // TESTES DO GET (Histórico)
  // ==========================================
  describe("GET - Buscar Histórico", () => {
    test("Deve retornar erro 401 se não estiver logado", async () => {
      vi.mocked(verifyToken).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/glucose");
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    test("Deve retornar 200 e a lista de medições do usuário", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        role: "PATIENT",
        name: "Teste",
        email: "t@t.com",
      });
      // Simulamos que o banco encontrou uma medição de 110 mg/dL
      mocks.state.records = [{ id: 1, glucose_value: 110, period: "Jejum" }];

      const req = new NextRequest("http://localhost:3000/api/glucose");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.records[0].glucose_value).toBe(110);
    });
  });

  // ==========================================
  // TESTES DO POST (Nova Medição)
  // ==========================================
  describe("POST - Registrar Glicemia", () => {
    test("Deve retornar erro 401 se não estiver logado", async () => {
      vi.mocked(verifyToken).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/glucose", {
        method: "POST",
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    test("Deve retornar erro 400 se faltar o valor da glicose na requisição", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        role: "PATIENT",
        name: "Teste",
        email: "t@t.com",
      });

      const req = new NextRequest("http://localhost:3000/api/glucose", {
        method: "POST",
        body: JSON.stringify({ period: "Jejum" }), // Esqueceu de mandar o glucose_value
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBe("Dados de glicemia incompletos.");
    });

    test("Deve retornar status 201 e salvar a medição com sucesso", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        role: "PATIENT",
        name: "Teste",
        email: "t@t.com",
      });

      const req = new NextRequest("http://localhost:3000/api/glucose", {
        method: "POST",
        body: JSON.stringify({
          glucose_value: 95,
          period: "Jejum",
          took_insulin: false,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
    });
  });
});
