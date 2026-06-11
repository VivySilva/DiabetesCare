import { render, screen, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

// 1. MOCKS (DUBLÊS) DAS APIS E NAVEGAÇÃO
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  usePathname: vi.fn(() => "/patient"), // <-- Ensinamos o Vitest a simular o usePathname!
}));

// Simulamos as três funções que a Home chama quando carrega
vi.mock("@/services/user/userService", () => ({ getUserProfile: vi.fn() }));
vi.mock("@/services/glucose/glucoseService", () => ({
  getGlucoseRecords: vi.fn(),
}));
vi.mock("@/services/community/communityService", () => ({
  getCommunityPosts: vi.fn(),
}));

// Ignoramos a renderização real de componentes complexos de gráficos para o teste de tela não quebrar
vi.mock("@/components/charts/GlucoseSummary", () => ({
  default: () => <div data-testid="glucose-summary" />,
}));
vi.mock("@/components/charts/GlucoseBoard", () => ({
  default: () => <div data-testid="glucose-board" />,
}));

import Home from "@/app/patient/page"; // <-- ATENÇÃO: Ajuste o caminho para onde está a sua Home de paciente!
import { getUserProfile } from "@/services/user/userService";
import { getGlucoseRecords } from "@/services/glucose/glucoseService";
import { getCommunityPosts } from "@/services/community/communityService";

describe("Tela Home do Paciente", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setamos um token falso no navegador simulado para passar na primeira verificação
    Storage.prototype.getItem = vi.fn(() => "token-falso-123");
  });

  test("Deve redirecionar para o Login se o token for inválido/expirado", async () => {
    // Simulamos que a API do perfil deu erro (token expirado)
    vi.mocked(getUserProfile).mockRejectedValue(new Error("Token expirado"));

    render(<Home />);

    // Espera o router.push('/login') ser chamado
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  test("Deve carregar os dados do usuário, glicemia e posts com sucesso", async () => {
    // 1. Simula perfil
    vi.mocked(getUserProfile).mockResolvedValue({
      user: { name: "Carlos Augusto" },
    });

    // 2. Simula histórico de glicose (API retorna os dados dentro de 'data')
    vi.mocked(getGlucoseRecords).mockResolvedValue({
      data: { records: [{ id: 1, glucose_value: 110, period: "Jejum" }] },
    });

    // 3. Simula posts da comunidade
    vi.mocked(getCommunityPosts).mockResolvedValue({ posts: [] });

    render(<Home />);

    // Como o Next.js pega apenas o primeiro nome (Carlos) no seu código, testamos isso:
    const textoBoasVindas = await screen.findByText("Olá, Carlos");
    expect(textoBoasVindas).toBeTruthy();

    // Garante que as APIs foram chamadas
    expect(getUserProfile).toHaveBeenCalled();
    expect(getGlucoseRecords).toHaveBeenCalled();
    expect(getCommunityPosts).toHaveBeenCalled();

    // Garante que os componentes visuais principais da Home foram renderizados
    expect(screen.getByTestId("glucose-summary")).toBeTruthy();
    expect(screen.getByTestId("glucose-board")).toBeTruthy();
    expect(screen.getByText("Artigos Recentes")).toBeTruthy();
  });
});
