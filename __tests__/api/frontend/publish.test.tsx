import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

// 1. MOCKS
const { mockPush } = vi.hoisted(() => {
  return { mockPush: vi.fn() };
});

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush, back: vi.fn() })),
  usePathname: vi.fn(() => "/rota-falsa"),
}));

// Simulamos o serviço da comunidade
const mockCreatePost = vi.fn();
vi.mock("@/services/community/communityService", () => ({
  createCommunityPost: (...args: any[]) => mockCreatePost(...args),
}));

import PublishPage from "@/app/professional/publish/page";

describe("Tela de Publicar Artigo (PublishPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => "token-123");
    // Como o JSDOM não tem document.execCommand real, criamos um dublê seguro para não quebrar
    document.execCommand = vi.fn();
  });

  test("O botão deve iniciar desabilitado e habilitar ao digitar um título", () => {
    render(<PublishPage />);

    const botao = screen.getByText("Publicar");
    expect(botao).toHaveProperty("disabled", true);

    const inputTitulo = screen.getByPlaceholderText(
      "Título da sua publicação...",
    );
    fireEvent.change(inputTitulo, {
      target: { value: "Os perigos do açúcar" },
    });

    expect(botao).toHaveProperty("disabled", false);
  });

  test("Deve formatar texto e enviar publicação com sucesso", async () => {
    mockCreatePost.mockResolvedValue(true);

    render(<PublishPage />);

    // Título
    fireEvent.change(
      screen.getByPlaceholderText("Título da sua publicação..."),
      { target: { value: "Dica Diária" } },
    );

    // INJEÇÃO DE TEXTO PARA A SUA VALIDAÇÃO NÃO BLOQUEAR O TESTE
    const contentDiv = document.querySelector(
      "div[contentEditable]",
    ) as HTMLElement;
    if (contentDiv) {
      contentDiv.textContent =
        "Aqui vai o conteúdo da publicação para passar na sua validação rigorosa.";
      contentDiv.innerHTML =
        "Aqui vai o conteúdo da publicação para passar na sua validação rigorosa.";
    }

    // Testa os botões da barra de ferramentas
    const btnBold = screen.getByTitle("Negrito");
    fireEvent.mouseDown(btnBold);
    expect(document.execCommand).toHaveBeenCalledWith("bold", false, undefined);

    // Clica em Publicar
    fireEvent.click(screen.getByText("Publicar"));

    await waitFor(() => {
      expect(mockCreatePost).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/professional");
    });
  });
});
