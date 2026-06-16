import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import React from "react";

// 1. MOCKS (DUBLÊS) COM VI.HOISTED
const mocks = vi.hoisted(() => {
  const state = { records: [] as any[], insertError: null as any };
  return {
    state,
    chain: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn(() => Promise.resolve({ data: state.records, error: null })),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn(() =>
        Promise.resolve({
          data: { id: 1, medication_name: "Insulina" },
          error: state.insertError,
        }),
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

// Dublê da validação Zod (medicationSchema)
vi.mock("@/schemas/medication", () => ({
  medicationSchema: {
    safeParse: vi.fn((body) => {
      if (!body.medication_name || !body.time) {
        return {
          success: false,
          error: { issues: [{ message: "Nome e horário são obrigatórios." }] },
        };
      }
      return { success: true, data: body };
    }),
  },
}));

// 2. IMPORTAÇÕES DA ROTA
// Ajuste se sua rota estiver em outra pasta (ex: '@/app/api/medications/route')
import { GET, POST } from "@/app/api/medications/route";
import { verifyToken } from "@/lib/auth";

// 3. OS TESTES
describe("API de Medicamentos (/api/medications)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.records = [];
    mocks.state.insertError = null;
  });

  // ==========================================
  // TESTES DO GET (Buscar Remédios)
  // ==========================================
  describe("GET - Listar Medicamentos", () => {
    test("Deve retornar erro 401 se não estiver logado", async () => {
      vi.mocked(verifyToken).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/medications");
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    test("Deve retornar 200 e a lista de medicamentos", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        role: "PATIENT",
        name: "Teste",
        email: "t@t.com",
      });
      mocks.state.records = [
        { id: 1, medication_name: "Metformina", time: "08:00" },
      ];

      const req = new NextRequest("http://localhost:3000/api/medications");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.records[0].medication_name).toBe("Metformina");
    });
  });

  // ==========================================
  // TESTES DO POST (Novo Medicamento)
  // ==========================================
  describe("POST - Registrar Medicamento", () => {
    test("Deve retornar erro 400 se faltar dados obrigatórios", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        role: "PATIENT",
        name: "Teste",
        email: "t@t.com",
      });

      const req = new NextRequest("http://localhost:3000/api/medications", {
        method: "POST",
        body: JSON.stringify({ category: "Oral" }), // Sem nome e hora
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    test("Deve salvar medicamento e criar notificação se notify for true", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        role: "PATIENT",
        name: "Teste",
        email: "t@t.com",
      });

      const req = new NextRequest("http://localhost:3000/api/medications", {
        method: "POST",
        body: JSON.stringify({
          category: "Insulina",
          medication_name: "Glargina",
          time: "22:00",
          notify: true,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);

      // O Supabase precisa ter sido chamado DUAS vezes no "from"
      // 1ª vez: from("medication_records")
      // 2ª vez: from("notifications")
      expect(mocks.chain.from).toHaveBeenCalledWith("medication_records");
      expect(mocks.chain.from).toHaveBeenCalledWith("notifications");
    });
  });
});
