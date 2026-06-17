import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

// 1. MOCKS (DUBLÊS) PARA O FRONTEND
// Fingimos ser o navegador (useRouter) para testar os redirecionamentos
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Fingimos ser a sua função que chama a API
vi.mock("@/services/auth/authService", () => ({
  loginUser: vi.fn(),
}));

// Resolve problema do Next.js com o componente <Link> nos testes
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// 2. IMPORTAÇÕES
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth/authService";

// ATENÇÃO: Ajuste este caminho para onde está o seu arquivo visual de Login!
// Exemplo: '@/app/login/page' ou '@/app/page'
import LoginPage from "@/app/login/page";

// 3. OS TESTES
describe("Tela de Login (LoginPage)", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Toda vez que a tela tentar usar o router.push, ela vai chamar o nosso mockPush
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  });

  test("Deve renderizar os campos de e-mail, senha e o botão corretamente", () => {
    render(<LoginPage />);

    // Procura os elementos na tela pelo "placeholder" ou pelo texto
    expect(screen.getByPlaceholderText("Seu e-mail cadastrado")).toBeTruthy();
    expect(screen.getByPlaceholderText("••••••••")).toBeTruthy();
    expect(screen.getByText("Entrar")).toBeTruthy();
  });

  test("Deve mostrar mensagem de erro se tentar logar com os campos vazios", async () => {
    render(<LoginPage />);

    // Clica no botão Entrar sem preencher nada
    const botaoEntrar = screen.getByText("Entrar");
    fireEvent.click(botaoEntrar);

    // Espera a mensagem de validação aparecer na tela
    const mensagemErro = await screen.findByText(
      "Por favor, preencha todos os campos.",
    );
    expect(mensagemErro).toBeTruthy();

    // Garante que o sistema não tentou chamar a API
    expect(loginUser).not.toHaveBeenCalled();
  });

  test('Deve mostrar mensagem de erro se o e-mail não tiver "@"', async () => {
    render(<LoginPage />);

    // Preenche os campos normalmente
    fireEvent.change(screen.getByPlaceholderText("Seu e-mail cadastrado"), {
      target: { value: "emailinvalido" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "senha123" },
    });

    // ALTERAÇÃO AQUI: Mudamos de .click para .submit para ignorar o bloqueio nativo do HTML5 no teste
    fireEvent.submit(screen.getByText("Entrar"));

    // Valida se a sua mensagem de UX apareceu na tela
    const mensagemErro = await screen.findByText(
      "Por favor, digite um e-mail válido.",
    );
    expect(mensagemErro).toBeTruthy();
  });

  test("Deve chamar a API e redirecionar o paciente se o login for um sucesso", async () => {
    // Simulamos que a API devolveu um sucesso com o token e dizendo que é um PATIENT
    vi.mocked(loginUser).mockResolvedValue({
      data: { token: "token123", user: { role: "PATIENT" } },
    });

    render(<LoginPage />);

    // Preenche corretamente
    fireEvent.change(screen.getByPlaceholderText("Seu e-mail cadastrado"), {
      target: { value: "paciente@teste.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "senha123" },
    });

    fireEvent.click(screen.getByText("Entrar"));

    // Esperamos as ações assíncronas terminarem
    await waitFor(() => {
      // Verifica se a API foi chamada com os dados certos
      expect(loginUser).toHaveBeenCalledWith("paciente@teste.com", "senha123");
      // Verifica se a tela redirecionou para o painel do paciente
      expect(mockPush).toHaveBeenCalledWith("/patient");
    });
  });

  test("Deve exibir a mensagem de erro que vem da API se as credenciais estiverem incorretas", async () => {
    // Simulamos que a API devolveu um erro
    vi.mocked(loginUser).mockRejectedValue(new Error("Usuário ou senha incorretos."));

    render(<LoginPage />);

    // Preenche corretamente mas com senha errada
    fireEvent.change(screen.getByPlaceholderText("Seu e-mail cadastrado"), {
      target: { value: "paciente@teste.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "senhaErrada123" },
    });

    fireEvent.submit(screen.getByText("Entrar"));

    // Espera a mensagem de erro aparecer na tela
    const mensagemErro = await screen.findByText("Usuário ou senha incorretos.");
    expect(mensagemErro).toBeTruthy();
    
    // Garante que não redirecionou
    expect(mockPush).not.toHaveBeenCalled();
  });
});
