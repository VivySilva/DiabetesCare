import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

// 1. MOCKS (DUBLÊS)
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
}));

vi.mock("@/services/auth/authService", () => ({
  requestPasswordRecovery: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// 2. IMPORTAÇÕES
import { requestPasswordRecovery } from "@/services/auth/authService";
// ATENÇÃO: Ajuste o caminho se a sua tela estiver em outra pasta
import ForgotPasswordPage from "@/app/forgot-password/page";

describe("Tela de Recuperar Senha (ForgotPasswordPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("O botão deve estar desabilitado se o campo de e-mail estiver vazio", () => {
    render(<ForgotPasswordPage />);

    const botaoEnviar = screen.getByText("Enviar Link de Recuperação");
    expect(botaoEnviar).toHaveProperty("disabled", true);
  });

  test("Deve habilitar o botão ao digitar o e-mail e exibir mensagem de erro se a API falhar", async () => {
    // Simulamos uma falha de conexão na API
    vi.mocked(requestPasswordRecovery).mockRejectedValue(
      new Error("Erro ao enviar e-mail de recuperação."),
    );

    render(<ForgotPasswordPage />);

    const inputEmail = screen.getByPlaceholderText("seu@email.com");
    fireEvent.change(inputEmail, { target: { value: "teste@teste.com" } });

    const botaoEnviar = screen.getByText("Enviar Link de Recuperação");
    expect(botaoEnviar).toHaveProperty("disabled", false); // Agora deve estar habilitado

    fireEvent.submit(botaoEnviar);

    // Verifica se a mensagem de erro que veio da API apareceu na tela
    const mensagemErro = await screen.findByText(
      "Erro ao enviar e-mail de recuperação.",
    );
    expect(mensagemErro).toBeTruthy();
  });

  test("Deve chamar a API e mudar a tela para o estado de sucesso", async () => {
    vi.mocked(requestPasswordRecovery).mockResolvedValue(true);

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "teste@teste.com" },
    });
    fireEvent.submit(screen.getByText("Enviar Link de Recuperação"));

    await waitFor(() => {
      expect(requestPasswordRecovery).toHaveBeenCalledWith("teste@teste.com");
      // Verifica se a tela mudou para o texto de confirmação verde
      expect(
        screen.getByText(/estiver em nossa base, você receberá um link/i),
      ).toBeTruthy();
      expect(screen.getByText("Voltar para o Login")).toBeTruthy();
    });
  });
});
