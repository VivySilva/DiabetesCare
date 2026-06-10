import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// 1. MOCKS (DUBLÊS)
const mocks = vi.hoisted(() => {
  const state = { user: null as any, error: null as any };
  return {
    state,
    chain: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() =>
        Promise.resolve({ data: state.user, error: state.error }),
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

// 2. IMPORTAÇÕES DA ROTA
import { GET } from "@/app/api/user/me/route"; // Ajuste se estiver em outra pasta
import { verifyToken } from "@/lib/auth";

describe("GET /api/user/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.user = null;
    mocks.state.error = null;
  });

  test("Deve retornar 401 se o usuário não estiver logado", async () => {
    vi.mocked(verifyToken).mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/user/me");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  test("Deve retornar 404 se o usuário não for encontrado no banco", async () => {
    // Adicionamos name e email para satisfazer o tipo AuthUser
    vi.mocked(verifyToken).mockResolvedValue({
      id: "123",
      role: "PATIENT",
      name: "Teste",
      email: "teste@exemplo.com",
    });
    mocks.state.user = null; // Banco vazio

    const req = new NextRequest("http://localhost:3000/api/user/me");
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  test("Deve retornar 200 e remover dados sensíveis da resposta", async () => {
    // Adicionamos name e email aqui também
    vi.mocked(verifyToken).mockResolvedValue({
      id: "123",
      role: "PATIENT",
      name: "Teste",
      email: "teste@exemplo.com",
    });

    // Simulamos o banco devolvendo tudo, INCLUSIVE as senhas
    mocks.state.user = {
      id: "123",
      name: "João Paciente",
      password_hash: "senha-super-secreta",
      password_reset_token: "token-secreto",
    };

    const req = new NextRequest("http://localhost:3000/api/user/me");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const dados = await res.json();
    expect(dados.user.name).toBe("João Paciente");
    // GARANTIA DE SEGURANÇA: As senhas não podem chegar no frontend!
    expect(dados.user.password_hash).toBeUndefined();
    expect(dados.user.password_reset_token).toBeUndefined();
  });
});
