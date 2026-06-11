import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// 1. DUBLÊS (MOCKS) COM VI.HOISTED
const mocks = vi.hoisted(() => {
  const state = {
    tokenRecord: null as any,
    updateError: null as any,
  };

  const chain = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    // Usado na busca do token
    maybeSingle: vi.fn(() =>
      Promise.resolve({ data: state.tokenRecord, error: null }),
    ),
    // Usado quando fazemos o await direto no update().eq()
    then: vi.fn((resolve) => resolve({ error: state.updateError })),
  };

  return { state, chain };
});

vi.mock("@/config/supabase", () => ({ default: mocks.chain }));

// Dublê para o bcrypt (criptografia)
vi.mock("bcrypt", () => ({
  default: {
    genSalt: vi.fn().mockResolvedValue("salt-falso"),
    hash: vi.fn().mockResolvedValue("senha-criptografada-falsa"),
  },
}));

// 2. IMPORTAÇÃO DA ROTA
// ATENÇÃO: Ajuste o caminho se a sua rota estiver noutra pasta!
import { POST } from "@/app/api/auth/forgot-password/reset/route";

// 3. OS TESTES
describe("POST /api/auth/forgot-password/reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Estado inicial: token válido para o futuro
    const dataFutura = new Date();
    dataFutura.setHours(dataFutura.getHours() + 2);

    mocks.state.tokenRecord = {
      id: "token-123",
      user_id: "user-123",
      expires_at: dataFutura.toISOString(),
      used: false,
    };
    mocks.state.updateError = null;
  });

  test("Deve retornar erro 400 se faltar token ou senha", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password/reset",
      {
        method: "POST",
        body: JSON.stringify({ token: "abc" }), // Faltou a nova senha
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  test("Deve retornar erro 400 se o token for inválido/não encontrado", async () => {
    mocks.state.tokenRecord = null; // Simulamos que o banco não achou o token

    const req = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password/reset",
      {
        method: "POST",
        body: JSON.stringify({
          token: "token-falso",
          new_password: "nova-senha",
        }),
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.erro).toBe("Token inválido.");
  });

  test("Deve retornar erro 400 se o token já tiver sido usado", async () => {
    mocks.state.tokenRecord.used = true; // Token já foi usado antes

    const req = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password/reset",
      {
        method: "POST",
        body: JSON.stringify({
          token: "token-real",
          new_password: "nova-senha",
        }),
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  test("Deve retornar erro 400 se o token estiver expirado", async () => {
    // Colocamos a data de expiração para ontem
    const dataPassada = new Date();
    dataPassada.setDate(dataPassada.getDate() - 1);
    mocks.state.tokenRecord.expires_at = dataPassada.toISOString();

    const req = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password/reset",
      {
        method: "POST",
        body: JSON.stringify({
          token: "token-real",
          new_password: "nova-senha",
        }),
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.erro).toBe("Token expirado.");
  });

  test("Deve retornar 500 se ocorrer um erro ao salvar a nova senha no banco", async () => {
    mocks.state.updateError = { message: "Erro no banco" }; // Simulamos falha ao salvar

    const req = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password/reset",
      {
        method: "POST",
        body: JSON.stringify({
          token: "token-real",
          new_password: "nova-senha",
        }),
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(500);
  });

  test("Deve retornar 200 e atualizar a senha com sucesso", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password/reset",
      {
        method: "POST",
        body: JSON.stringify({
          token: "token-real",
          new_password: "nova-senha",
        }),
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.mensagem).toBe("Senha redefinida com sucesso!");
  });
});
