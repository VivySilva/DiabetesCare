import { test, expect, vi, describe, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// 1. MOCKS (DUBLÊS) COM VI.HOISTED
const mocks = vi.hoisted(() => {
  const state = {
    posts: [] as any[],
    patients: [] as any[],
    insertData: null as any,
  };

  return {
    state,
    chain: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      // .order() é o final da linha para buscar os posts
      order: vi.fn(() => Promise.resolve({ data: state.posts, error: null })),
      // .in() é o final da linha para buscar os autores
      in: vi.fn(() => Promise.resolve({ data: state.patients, error: null })),
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

// Dublê da validação Zod
vi.mock("@/schemas/community", () => ({
  communityPostSchema: {
    safeParse: vi.fn((body) => {
      if (!body.title || !body.content_html) {
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
// Ajuste se sua rota estiver em outra pasta! (ex: '@/app/api/community/route')
import { GET, POST } from "@/app/api/community/route";
import { verifyToken } from "@/lib/auth";

// 3. OS TESTES
describe("API da Comunidade (/api/community)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.posts = [];
    mocks.state.patients = [];
    mocks.state.insertData = { id: 1, title: "Meu Novo Post" };
  });

  // ==========================================
  // TESTES DO GET (Buscar Feed)
  // ==========================================
  describe("GET - Listar Publicações", () => {
    test("Deve retornar 200 e formatar os posts com os dados do autor", async () => {
      // 1. O banco devolve um post feito pelo usuário "autor-123"
      mocks.state.posts = [
        { id: 1, title: "Dica de Saúde", author_id: "autor-123" },
      ];

      // 2. O banco devolve os dados desse paciente quando buscar pelo ID
      mocks.state.patients = [
        { id: "autor-123", name: "Maria da Silva", role: "PATIENT" },
      ];

      const req = new NextRequest("http://localhost:3000/api/community");
      const res = await GET(); // Sua rota GET da comunidade não recebe 'req'

      expect(res.status).toBe(200);

      const json = await res.json();

      // Valida se o backend fez a "costura" corretamente
      expect(json.posts[0].title).toBe("Dica de Saúde");
      expect(json.posts[0].users).toBeDefined();
      expect(json.posts[0].users.name).toBe("Maria da Silva");
    });
  });

  // ==========================================
  // TESTES DO POST (Criar Post)
  // ==========================================
  describe("POST - Criar Publicação", () => {
    test("Deve retornar erro 401 se não estiver logado", async () => {
      vi.mocked(verifyToken).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/community", {
        method: "POST",
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    test("Deve retornar erro 400 se faltar título ou conteúdo", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        role: "PROFESSIONAL",
        name: "Dr. Teste",
        email: "t@t.com",
      });

      const req = new NextRequest("http://localhost:3000/api/community", {
        method: "POST",
        body: JSON.stringify({ title: "Apenas título" }), // Falta o content_html
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    test("Deve retornar status 201 e criar o post com sucesso", async () => {
      vi.mocked(verifyToken).mockResolvedValue({
        id: "user-123",
        role: "PROFESSIONAL",
        name: "Dr. Teste",
        email: "t@t.com",
      });

      const req = new NextRequest("http://localhost:3000/api/community", {
        method: "POST",
        body: JSON.stringify({
          title: "Benefícios da Água",
          content_html: "<p>Beba água!</p>",
          category: "Saúde",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.mensagem).toBe("Publicação criada com sucesso!");
    });
  });
});
