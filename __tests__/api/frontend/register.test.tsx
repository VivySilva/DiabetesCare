import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

// 1. MOCKS (DUBLÊS)
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("@/services/auth/authService", () => ({
  registerUser: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// 2. IMPORTAÇÕES
import { registerUser } from "@/services/auth/authService";
// ATENÇÃO: Ajuste o caminho se a sua tela estiver em outra pasta (ex: '@/app/register/page')
import RegisterPage from "@/app/register/page";

describe("Tela de Cadastro (RegisterPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Deve renderizar os campos iniciais para Paciente corretamente", () => {
    render(<RegisterPage />);
    expect(
      screen.getByPlaceholderText("Como deseja ser chamado?"),
    ).toBeTruthy();
    expect(screen.getByPlaceholderText("seu@email.com")).toBeTruthy();
    expect(screen.getByPlaceholderText("Mínimo 8 caracteres")).toBeTruthy();
    expect(screen.getByPlaceholderText("Repita sua senha")).toBeTruthy();
    // Por padrão (Paciente), o campo de CRM não deve estar na tela
    expect(screen.queryByPlaceholderText("CRM / CRN")).toBeNull();
  });

  test("Deve exibir o campo de CRM/CRN quando o botão Profissional for clicado", () => {
    render(<RegisterPage />);

    // Clica na aba de Profissional
    fireEvent.click(screen.getByText("Profissional"));

    // Agora o campo deve aparecer
    expect(screen.getByPlaceholderText("CRM / CRN")).toBeTruthy();
  });

  test("Deve mostrar erro se a senha e a confirmação de senha forem diferentes", async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), {
      target: { value: "senha123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita sua senha"), {
      target: { value: "senhaDiferente" },
    });

    fireEvent.submit(screen.getByText("Cadastrar"));

    const mensagemErro = await screen.findByText("As senhas não coincidem.");
    expect(mensagemErro).toBeTruthy();
    expect(registerUser).not.toHaveBeenCalled();
  });

  test("Deve chamar a API e exibir a mensagem de sucesso ao preencher tudo corretamente", async () => {
    vi.mocked(registerUser).mockResolvedValue(true);

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Como deseja ser chamado?"), {
      target: { value: "Maria" },
    });
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "maria@teste.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), {
      target: { value: "senha123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita sua senha"), {
      target: { value: "senha123" },
    });

    fireEvent.submit(screen.getByText("Cadastrar"));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
      // Verifica se o texto do seu SuccessModal apareceu na tela
      expect(
        screen.getByText(
          "Sua conta foi criada com sucesso! Agora você pode fazer login.",
        ),
      ).toBeTruthy();
    });
  });
});
