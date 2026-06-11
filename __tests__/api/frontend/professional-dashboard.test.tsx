import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

// 1. MOCKS
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => "/rota-falsa"), // <-- Adicionamos isso para o Header não quebrar!
}));

vi.mock("@/services/user/userService", () => ({ getUserProfile: vi.fn() }));
vi.mock("@/services/community/communityService", () => ({
  getCommunityPosts: vi.fn(),
  deleteCommunityPost: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

import ProfissionalPage from "@/app/professional/page";
import { getUserProfile } from "@/services/user/userService";
import {
  getCommunityPosts,
  deleteCommunityPost,
} from "@/services/community/communityService";

describe("Painel do Profissional (Dashboard)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => "token-123");
    // Para contornar o window.confirm que barra testes automatizados
    window.confirm = vi.fn(() => true);
  });

  test("Deve filtrar e mostrar apenas as publicações do próprio profissional", async () => {
    vi.mocked(getUserProfile).mockResolvedValue({ user: { id: "prof-1" } });

    vi.mocked(getCommunityPosts).mockResolvedValue({
      posts: [
        { id: "1", title: "Meu Post", author_id: "prof-1" },
        { id: "2", title: "Post de Outro", author_id: "prof-2" }, // Não deve aparecer
      ],
    });

    render(<ProfissionalPage />);

    // Deve mostrar "Meu Post"
    const meuPost = await screen.findByText("Meu Post");
    expect(meuPost).toBeTruthy();

    // Não deve mostrar o post do outro
    expect(screen.queryByText("Post de Outro")).toBeNull();
  });
});
