import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// 1. DUBLÊS (MOCKS) COM VI.HOISTED
const supabaseMocks = vi.hoisted(() => {
  // Criamos um estado que pode ser alterado dinamicamente dentro de cada teste
  const state = {
    existingUser: null as any,
    insertError: null as any,
    newUser: { id: "new-123", name: "Teste" } as any,
  };

  return {
    state,
    chain: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(() =>
        Promise.resolve({ data: state.existingUser, error: null }),
      ),
      single: vi.fn(() =>
        Promise.resolve({ data: state.newUser, error: state.insertError }),
      ),
    },
  };
});

vi.mock("@/config/supabase", () => ({
  default: supabaseMocks.chain,
}));

// Simulamos a criptografia de senha para não rodar o bcrypt real no teste
vi.mock("@/lib/hash", () => ({
  hashPassword: vi.fn(() => Promise.resolve("hash-falso-123")),
}));

// Simulamos a validação do Zod
vi.mock("@/schemas/auth", () => ({
  registerSchema: {
    safeParse: vi.fn((body) => {
      if (!body.name || !body.email || !body.password) {
        return {
          success: false,
          error: { issues: [{ message: "Dados obrigatórios ausentes" }] },
        };
      }
      return { success: true, data: body };
    }),
  },
}));

// Note que o successResponse do seu register usa status 201 por padrão quando cria algo
vi.mock("@/lib/api-response", () => ({
  successResponse: vi.fn(
    (data, status = 201) => new Response(JSON.stringify(data), { status }),
  ),
  errorResponse: vi.fn(
    (msg, status) => new Response(JSON.stringify({ error: msg }), { status }),
  ),
}));

// 2. IMPORTAÇÃO DA ROTA REAL
import { POST } from "@/app/api/auth/register/route";

// 3. OS TESTES
describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Resetamos o estado padrão antes de cada teste
    supabaseMocks.state.existingUser = null;
    supabaseMocks.state.insertError = null;
    supabaseMocks.state.newUser = { id: "new-123", name: "User Teste" };
  });

  test("Deve retornar erro 400 se os dados obrigatórios estiverem ausentes", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "incompleto@teste.com" }), // Sem nome e sem senha
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  test("Deve retornar erro 400 se o papel for profissional e não houver licenseNumber", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Dr. Silva",
        email: "dr@diabetescare.com",
        password: "senhaSegura123",
        role: "professional", // Falta o licenseNumber
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  test("Deve retornar erro 400 se o e-mail já estiver cadastrado no sistema", async () => {
    // Simulamos que o banco de dados encontrou alguém com esse e-mail
    supabaseMocks.state.existingUser = { id: "usuario-antigo-123" };

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Novo Paciente",
        email: "jaexistente@teste.com",
        password: "senhaSegura123",
        role: "patient",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  test("Deve retornar erro 500 se ocorrer uma falha ao inserir o registro no Supabase", async () => {
    // Simulamos que a operação de inserção deu erro
    supabaseMocks.state.insertError = {
      message: "Erro de conexão com o banco",
    };

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Carlos Paciente",
        email: "carlos@teste.com",
        password: "senhaSegura123",
        role: "patient",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
  });

  test("Deve retornar status 201 e criar a conta do paciente com sucesso", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Maria Paciente",
        email: "maria@teste.com",
        password: "senhaSegura123",
        role: "patient",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(201); // Validando o status de criação bem-sucedida
  });
});
