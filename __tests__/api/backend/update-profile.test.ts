import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// 1. MOCKS (DUBLÊS)
const mocks = vi.hoisted(() => {
  const chain: any = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(), // Retorna This para permitir o encadeamento do .eq()
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    // O .then() age como o final da promessa para o update().eq()
    then: vi.fn((resolve) => resolve({ error: null })),
  };
  return { chain };
});

vi.mock("@/config/supabase", () => ({ default: mocks.chain }));

vi.mock("@/lib/auth", () => ({
  verifyToken: vi.fn(),
  unauthorizedResponse: vi.fn(
    () =>
      new Response(JSON.stringify({ erro: "Não autorizado" }), { status: 401 }),
  ),
}));

vi.mock("bcrypt", () => ({
  default: {
    genSalt: vi.fn().mockResolvedValue("salt-falso"),
    hash: vi.fn().mockResolvedValue("nova-senha-criptografada"),
  },
}));

vi.mock("@/schemas/user", () => ({
  updateUserSchema: {
    safeParse: vi.fn((body) => {
      if (body.email === "email-invalido") {
        return {
          success: false,
          error: { issues: [{ message: "Formato inválido" }] },
        };
      }
      return { success: true, data: body };
    }),
  },
}));

import { PUT } from "@/app/api/user/me/route";
import { verifyToken } from "@/lib/auth";

describe("PUT /api/user/me (Atualização de Perfil)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.chain.maybeSingle.mockResolvedValue({ data: null, error: null });
    // O padrão é o update dar certo
    mocks.chain.then.mockImplementation((resolve: any) =>
      resolve({ error: null }),
    );
  });

  test("Deve retornar 401 se não estiver logado", async () => {
    vi.mocked(verifyToken).mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/user/me", {
      method: "PUT",
    });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  test("Deve retornar 409 se tentar usar um e-mail que já existe em outra conta", async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: "user-123",
      role: "PATIENT",
      name: "Ana",
      email: "ana@teste.com",
    });
    mocks.chain.maybeSingle.mockResolvedValueOnce({
      data: { id: "user-999" },
      error: null,
    });

    const req = new NextRequest("http://localhost:3000/api/user/me", {
      method: "PUT",
      body: JSON.stringify({ email: "email_ja_usado@teste.com" }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(409);
  });

  test("Deve criptografar a senha caso ela seja enviada na atualização", async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: "user-123",
      role: "PATIENT",
      name: "Ana",
      email: "ana@teste.com",
    });

    const req = new NextRequest("http://localhost:3000/api/user/me", {
      method: "PUT",
      body: JSON.stringify({
        name: "Ana Maria",
        password: "senha-nova-segura",
      }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);
    expect(mocks.chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ password_hash: "nova-senha-criptografada" }),
    );
  });

  test("Deve lidar com o erro PGRST204 (coluna ausente) removendo a coluna e tentando novamente", async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      id: "user-123",
      role: "PATIENT",
      name: "Ana",
      email: "ana@teste.com",
    });

    // Na 1ª tentativa, simulamos o erro do Supabase. Na 2ª, sucesso absoluto.
    mocks.chain.then
      .mockImplementationOnce((resolve: any) =>
        resolve({
          error: {
            code: "PGRST204",
            message: "Could not find the 'coluna_inventada' column",
          },
        }),
      )
      .mockImplementationOnce((resolve: any) => resolve({ error: null }));

    const req = new NextRequest("http://localhost:3000/api/user/me", {
      method: "PUT",
      body: JSON.stringify({ name: "Ana Maria", coluna_inventada: "valor" }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);
    expect(mocks.chain.update).toHaveBeenCalledTimes(2);
  });
});
