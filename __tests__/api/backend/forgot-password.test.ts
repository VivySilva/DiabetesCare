import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// 1. DUBLÊS (MOCKS) COM VI.HOISTED
const mocks = vi.hoisted(() => {
  // Define variáveis de ambiente ANTES dos imports para o env.ts validar
  process.env.EMAIL_USER = "teste@diabetescare.com";
  process.env.EMAIL_PASS = "senha-teste";

  const state = {
    user: null as any,
    insertError: null as any,
    emailError: null as any,
  };

  return {
    state,
    supabaseChain: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(() =>
        Promise.resolve({ data: state.user, error: null }),
      ),
      insert: vi.fn(() => Promise.resolve({ error: state.insertError })),
    },
    transporter: {
      sendMail: vi.fn(() => {
        if (state.emailError) return Promise.reject(state.emailError);
        return Promise.resolve(true);
      }),
    },
  };
});

vi.mock("@/config/supabase", () => ({ default: mocks.supabaseChain }));

// Criamos um dublê para o seu arquivo de e-mail
type EmailModule = { default: typeof mocks.transporter; EMAIL_FROM?: string };
vi.mock("@/config/email", (): EmailModule => ({ default: mocks.transporter, EMAIL_FROM: '"DiabetesCare" <teste@diabetescare.com>' }));

// 2. IMPORTAÇÃO DA ROTA
// ATENÇÃO: Ajuste este caminho se a sua rota estiver em outra pasta
import { POST } from "@/app/api/auth/forgot-password/request/route";

// 3. OS TESTES
describe("POST /api/auth/forgot-password/request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Estado inicial padrão
    mocks.state.user = null;
    mocks.state.insertError = null;
    mocks.state.emailError = null;
  });

  test("Deve retornar erro 400 se o email não for enviado na requisição", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password/request",
      {
        method: "POST",
        body: JSON.stringify({}), // Corpo vazio
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  test("Deve retornar mensagem genérica (200) se o email NÃO existir no banco", async () => {
    // Banco não encontra ninguém
    mocks.state.user = null;

    const req = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password/request",
      {
        method: "POST",
        body: JSON.stringify({ email: "naoexiste@teste.com" }),
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(200);

    // Testa sua regra de segurança contra enumeração de e-mails
    const data = await response.json();
    expect(data.mensagem).toBe(
      "Se o e-mail existir, um link de recuperação será enviado.",
    );

    // Garante que o e-mail NÃO foi enviado
    expect(mocks.transporter.sendMail).not.toHaveBeenCalled();
  });

  test("Deve gerar token, enviar e-mail e retornar 200 se o usuário for encontrado", async () => {
    // Simulamos que o banco encontrou o usuário
    mocks.state.user = { id: "123", name: "Usuário Teste" };

    const req = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password/request",
      {
        method: "POST",
        body: JSON.stringify({ email: "existe@teste.com" }),
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(200);

    // Garante que a função de enviar e-mail FOI chamada
    expect(mocks.transporter.sendMail).toHaveBeenCalled();
  });

  test("Deve retornar erro 500 se o envio do e-mail falhar", async () => {
    mocks.state.user = { id: "123", name: "Usuário Teste" };

    // Forçamos uma falha no envio do e-mail (ex: servidor SMTP caiu)
    mocks.state.emailError = new Error("Falha no provedor de e-mail");

    const req = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password/request",
      {
        method: "POST",
        body: JSON.stringify({ email: "existe@teste.com" }),
      },
    );

    const response = await POST(req);
    expect(response.status).toBe(500);
  });
});
