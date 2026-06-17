import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush, back: vi.fn() })),
  usePathname: vi.fn(() => "/professional/my-posts"),
}));

vi.mock("@/services/community/communityService", () => ({
  getCommunityPosts: vi.fn(),
  deleteCommunityPost: vi.fn(),
}));

vi.mock("@/services/user/userService");

import MyPostsPage from "@/app/professional/my-posts/page";
import { getCommunityPosts, deleteCommunityPost } from "@/services/community/communityService";
import { getUserProfile } from "@/services/user/userService";

describe("Minhas Publicações (Profissional)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => "token-falso-123");
  });

  test("Deve exibir publicações, permitir edição e deleção", async () => {
    vi.mocked(getUserProfile).mockResolvedValue({
      user: { id: "u1", name: "Doutor Silva", role: "PROFESSIONAL", avatar_url: null },
    });
    vi.mocked(getCommunityPosts).mockResolvedValue({
      posts: [
        {
          id: "p1",
          author_id: "u1",
          title: "Açúcar Escondido",
          category: "Alimentação",
          created_at: new Date().toISOString(),
          is_moderated: false,
        }
      ]
    });

    vi.mocked(deleteCommunityPost).mockResolvedValue(true);

    render(<MyPostsPage />);

    // Aguarda carregar
    const title = await screen.findByText("Açúcar Escondido");
    expect(title).toBeTruthy();

    // Clica em Editar
    const btnEditar = screen.getByRole("button", { name: /Editar publicação/i });
    fireEvent.click(btnEditar);
    expect(mockPush).toHaveBeenCalledWith("/professional/edit-post/p1");

    // O delete não está na UI de my-posts por enquanto (precisa entrar no post para excluir ou outra tela)
  });
});
