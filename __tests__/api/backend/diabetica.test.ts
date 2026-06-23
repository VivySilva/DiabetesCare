import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// 1. MOCK DO FETCH GLOBAL
// Substituímos o comunicador padrão da internet por um dublê nosso
const fetchMock = vi.fn();
global.fetch = fetchMock;

// 2. IMPORTAÇÃO DA ROTA
// ATENÇÃO: Ajuste o caminho se a sua rota da IA estiver em outro lugar (ex: '@/app/api/chat/route')
import { POST } from "@/app/api/diabetica/chat/route";

// 3. OS TESTES
describe("API da IA Diabética (/api/chat)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Deve retornar erro 400 se enviar uma mensagem vazia", async () => {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "" }), // Mensagem vazia (vai falhar no Zod)
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    // Garante que o sistema barrou ANTES de tentar gastar recursos chamando o servidor Python
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("Deve retornar 200 e a resposta da IA em caso de sucesso", async () => {
    // Simulamos o servidor Python respondendo corretamente
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        response: "Olá! Sou a Diabética. Como está sua glicose hoje?",
      }),
    });

    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "Oi, tudo bem?" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.response).toBe(
      "Olá! Sou a Diabética. Como está sua glicose hoje?",
    );
  });

  test("Deve retornar erro 504 se o Python demorar muito (Timeout)", async () => {
    // Simulamos o erro de AbortError (que acontece quando o AbortSignal da sua rota expira)
    const timeoutError = new Error("The operation was aborted");
    timeoutError.name = "AbortError";
    fetchMock.mockRejectedValue(timeoutError);

    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Me dê uma receita com 0 carboidratos.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(504);

    const data = await res.json();
    expect(data.error).toBe(
      "O serviço Diabetica demorou muito para responder.",
    );
  });

  test("Deve retornar erro 503 se o servidor Python estiver desligado", async () => {
    vi.stubEnv("GROQ_API_KEY", "");

    const connError = new Error("fetch failed");
    (connError as any).code = "ECONNREFUSED";
    fetchMock.mockRejectedValue(connError);

    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "Oi" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);

    const data = await res.json();
    expect(data.error).toContain("GROQ_API_KEY");

    vi.unstubAllEnvs();
  });

  test("Deve usar Groq em produção quando GROQ_API_KEY estiver configurada", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DIABETICA_API_URL", "");
    vi.stubEnv("GROQ_API_KEY", "gsk-test-key");

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Resposta via Groq sobre diabetes." } }],
      }),
    });

    const req = new NextRequest("http://localhost:3000/api/diabetica/chat", {
      method: "POST",
      body: JSON.stringify({ message: "Oi" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.response).toBe("Resposta via Groq sobre diabetes.");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
      }),
    );

    vi.unstubAllEnvs();
  });

  test("Deve retornar erro 503 se nenhum backend estiver configurado em produção", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DIABETICA_API_URL", "");
    vi.stubEnv("GROQ_API_KEY", "");

    const req = new NextRequest("http://localhost:3000/api/diabetica/chat", {
      method: "POST",
      body: JSON.stringify({ message: "Oi" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);

    const data = await res.json();
    expect(data.error).toContain("GROQ_API_KEY");

    vi.unstubAllEnvs();
  });
});
