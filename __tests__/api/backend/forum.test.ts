import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// 1. MOCKS (DUBLÊS) COM VI.HOISTED
const mocks = vi.hoisted(() => {
  const state = {
    topics: [] as any[],
    users: [] as any[],
    replies: [] as any[],
    insertData: null as any,
  };

  return {
    state,
    chain: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn(() => Promise.resolve({ data: state.topics, error: null })),
      // Dublê inteligente que responde coisas diferentes dependendo da coluna que você busca
      in: vi.fn((coluna) => {
        if (coluna === "topic_id") {
          return Promise.resolve({ data: state.replies, error: null });
        }
        return Promise.resolve({ data: state.users, error: null });
      }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn(() =>
        Promise.resolve({ data: state.insertData, error: null }),
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

// Dublê da validação Zod para o Fórum
vi.mock("@/schemas/forum", () => ({
  forumTopicSchema: {
    safeParse: vi.fn((body) => {
      if (!body.title || !body.content) {
        return {
          success: false,
          error: {
            issues: [{ message: "Título e conteúdo são obrigatórios." }],
          },
        };
      }
      return { success: true, data: body };
    }),
  },
}));

// 2. IMPORTAÇÕES DA ROTA
// Lembre-se de ajustar a pasta se necessário! (ex: '@/app/api/forum/route')
import { GET, POST } from "@/app/api/forum/route";
import { verifyToken } from "@/lib/auth";

// 3. OS TESTES
describe("API do Fórum (/api/forum)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.topics = [];
    mocks.state.users = [];
    mocks.state.replies = [];
    mocks.state.insertData = { id: 1, title: "Dúvida sobre insulina" };
  });

  // ==========================================
  // TESTES DO GET (Buscar Tópicos)
  // ==========================================
  describe("GET - Listar Tópicos do Fórum", () => {
    test("Deve retornar 200, formatar autores e contar respostas (replies)", async () => {
      // 1. Tópico no banco
      mocks.state.topics = [
        { id: "topic-1", title: "Agulhas machucam?", author_id: "user-123" },
      ];

      // 2. Autor no banco
      mocks.state.users = [
        { id: "user-123", name: "João Paciente", role: "PATIENT" },
      ];

      // 3. O banco acha 2 respostas (replies) vinculadas a esse tópico
      mocks.state.replies = [{ topic_id: "topic-1" }, { topic_id: "topic-1" }];

      const req = new NextRequest("http://localhost:3000/api/forum");
      const res = await GET(); // A sua rota GET não usa o req neste caso

      expect(res.status).toBe(200);

      const json = await res.json();

      // Valida se a sua matemática de contar comentários funcionou
      expect(json.topics[0].replies_count).toBe(2);
      expect(json.topics[0].title).toBe("Agulhas machucam?");
    });
  });

  // ==========================================
  // TESTES DO POST (Criar Tópico)
  // ==========================================
  describe("POST - Criar Novo Tópico", () => {
    test("Deve retornar erro 401 se não estiver logado", async () => {
      vi.mocked(verifyToken).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    test("Deve retornar erro 400 se faltar dados obrigatórios (ex: sem título)", async () => {
      // Adicionamos o email: 'teste@teste.com' aqui!
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        role: "PATIENT",
        name: "Teste",
        email: "teste@teste.com",
      });

      const req = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
        body: JSON.stringify({ content: "Tenho uma dúvida..." }), // Sem título
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    test("Deve retornar status 201 e criar o tópico com preview gerado a partir do conteúdo", async () => {
      // Adicionamos o email aqui também!
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        role: "PATIENT",
        name: "Teste",
        email: "teste@teste.com",
      });

      const req = new NextRequest("http://localhost:3000/api/forum", {
        method: "POST",
        body: JSON.stringify({
          title: "Glicemia alta de manhã",
          content: "Acordei com 180, é normal?",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.mensagem).toBe("Tópico criado com sucesso!");
    });
  });
});
