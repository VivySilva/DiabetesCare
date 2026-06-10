import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// 1. DUBLÊS (MOCKS) COM VI.HOISTED
const supabaseMocks = vi.hoisted(() => {
  const result = { data: null as any, error: null as any };

  return {
    result,
    chain: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(), // Usado para salvar o log de login
      maybeSingle: vi.fn(() => Promise.resolve(result)), // Usado para buscar o usuário
    },
  };
});

vi.mock("@/config/supabase", () => ({
  default: supabaseMocks.chain,
}));

// Simulamos as funções de segurança e criptografia
vi.mock("@/lib/hash", () => ({
  comparePassword: vi.fn(),
}));

vi.mock("@/lib/jwt", () => ({
  signToken: vi.fn(() => "token-falso-123"),
}));

// Simulamos a validação (Zod) para não dependermos do arquivo real no teste
vi.mock("@/schemas/auth", () => ({
  loginSchema: {
    safeParse: vi.fn((body) => {
      if (!body.email || !body.password) {
        return {
          success: false,
          error: { issues: [{ message: "Dados inválidos" }] },
        };
      }
      return { success: true, data: body };
    }),
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

// 2. IMPORTAÇÕES
import { comparePassword } from "@/lib/hash";
// Ajuste este caminho se a sua rota de login estiver em outra pasta!
import { POST } from "@/app/api/auth/login/route";

// 3. OS TESTES
describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por padrão, o banco não encontra ninguém
    supabaseMocks.result.data = null;
  });

  test("Deve retornar erro 400 se faltarem dados (email ou senha)", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "apenas-email@teste.com" }), // Sem senha
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  test("Deve retornar erro 401 se o usuário não for encontrado no banco", async () => {
    // Banco retorna vazio (null)
    supabaseMocks.result.data = null;

    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "naoexiste@teste.com",
        password: "senha123",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);

    const dados = await response.json();
    expect(dados.error).toBe("Credenciais inválidas");
  });

  test("Deve retornar erro 401 se a senha estiver incorreta", async () => {
    // Banco encontra o usuário
    supabaseMocks.result.data = {
      id: "123",
      email: "teste@teste.com",
      password_hash: "hash-real",
    };

    // Mas a função de comparar senhas diz que a senha digitada está ERRADA (false)
    vi.mocked(comparePassword).mockResolvedValue(false);

    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "teste@teste.com",
        password: "senha-errada",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  test("Deve retornar 200 e o token se o login for um sucesso", async () => {
    // Banco encontra o usuário
    supabaseMocks.result.data = {
      id: "123",
      name: "João Paciente",
      email: "teste@teste.com",
      role: "PATIENT",
      password_hash: "hash-real",
    };

    // A função de comparar senhas diz que a senha digitada está CERTA (true)
    vi.mocked(comparePassword).mockResolvedValue(true);

    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "teste@teste.com",
        password: "senha-correta",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const dados = await response.json();
    // Validamos se o token falso que criamos no dublê foi retornado
    expect(dados.token).toBe("token-falso-123");
    expect(dados.user.name).toBe("João Paciente");
  });
});
