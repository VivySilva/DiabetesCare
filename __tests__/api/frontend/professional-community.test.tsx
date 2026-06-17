import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

// 1. MOCKS
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush, back: vi.fn() })),
  usePathname: vi.fn(() => "/professional/community"),
}));

vi.mock("@/services/community/communityService", () => ({
  getCommunityPosts: vi.fn(),
}));

vi.mock("@/services/forum/forumService", () => ({
  getForumTopics: vi.fn(),
  likeForumTopic: vi.fn(),
}));

import ProfessionalCommunityPage from "@/app/professional/community/page";
import { getCommunityPosts } from "@/services/community/communityService";
import { getForumTopics } from "@/services/forum/forumService";

describe("Comunidade do Profissional", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => "token-falso-123");
  });

  test("Deve exibir a lista de publicações e permitir a busca", async () => {
    vi.mocked(getCommunityPosts).mockResolvedValue({
      posts: [
        {
          id: "1",
          title: "Benefícios do Exercício Físico",
          category: "Exercício",
          author_id: "medico-1",
          is_moderated: true,
          created_at: new Date().toISOString(),
          users: { name: "Dr. João", role: "PROFESSIONAL", avatar_url: null },
        },
        {
          id: "2",
          title: "Dietas Low-Carb para Diabéticos",
          category: "Alimentação",
          author_id: "medico-2",
          is_moderated: false,
          created_at: new Date().toISOString(),
          users: { name: "Nutri. Maria", role: "PROFESSIONAL", avatar_url: null },
        }
      ]
    });

    vi.mocked(getForumTopics).mockResolvedValue({
      topics: [
        {
          id: "t1",
          title: "Dúvida sobre insulina",
          preview: "Como armazeno?",
          replies_count: 5,
          likes_count: 2,
          is_moderated: false,
          created_at: new Date().toISOString(),
          users: { name: "Usuário Anônimo", role: "PATIENT", avatar_url: null },
        }
      ]
    });

    render(<ProfessionalCommunityPage />);

    // Aguarda o carregamento inicial (Artigos)
    const title1 = await screen.findByText("Benefícios do Exercício Físico");
    expect(title1).toBeTruthy();
    expect(screen.getByText("Dietas Low-Carb para Diabéticos")).toBeTruthy();

    // Troca para a aba Fórum
    const btnForum = screen.getByText("Fórum");
    fireEvent.click(btnForum);

    // Deve carregar o tópico do fórum
    const forumTopic = await screen.findByText("Dúvida sobre insulina");
    expect(forumTopic).toBeTruthy();

    // Testa o clique no tópico
    fireEvent.click(forumTopic);
    expect(mockPush).toHaveBeenCalledWith("/professional/forum/t1");
  });
});
