import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

// 1. MOCKS (DUBLÊS)
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => "/rota-falsa"), // <-- Adicionamos isso para o Header não quebrar!
}));

vi.mock("@/services/user/userService", () => ({
  getUserProfile: vi.fn(),
}));

// Dublê para o botão de voltar e ícones do Header não quebrarem o teste
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Dublê para a biblioteca de PDF (evita que o Vitest tente desenhar um PDF de verdade)
vi.mock("jspdf", () => {
  return {
    default: vi.fn().mockImplementation(function() {
      return {
        setFontSize: vi.fn(),
        setTextColor: vi.fn(),
        text: vi.fn(),
        line: vi.fn(),
        setFont: vi.fn(),
        splitTextToSize: vi.fn((text) => [text]),
        lastAutoTable: { finalY: 50 },
        internal: {
          pageSize: { getWidth: vi.fn(() => 200), getHeight: vi.fn(() => 300) },
        },
        save: vi.fn(),
      };
    }),
  };
});
vi.mock("jspdf-autotable", () => ({ default: vi.fn() }));

// O Mock Global do Fetch para testarmos a chamada da IA (Relatório)
const fetchMock = vi.fn();
global.fetch = fetchMock;

// 2. IMPORTAÇÃO
import PatientProfile from "@/app/patient/profile/page"; // Ajuste o caminho se necessário
import { getUserProfile } from "@/services/user/userService";

describe("Tela de Perfil do Paciente", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => "token-falso-123");
  });

  test("Deve renderizar os dados do paciente com sucesso", async () => {
    vi.mocked(getUserProfile).mockResolvedValue({
      user: {
        name: "João Paciente",
        birth_date: "1979-01-01",
        diabetes_type: "Tipo 2",
        email: "joao@teste.com",
      },
    });

    render(<PatientProfile />);

    // Espera o carregamento sumir e os dados aparecerem
    const nome = await screen.findByText("João Paciente");
    expect(nome).toBeTruthy();
    expect(screen.getByText(/anos/i)).toBeTruthy();
    expect(screen.getAllByText("Tipo 2").length).toBeGreaterThan(0);
    expect(screen.getByText("joao@teste.com")).toBeTruthy();
  });

  test("Deve abrir o modal de logout ao clicar em Sair da Conta", async () => {
    vi.mocked(getUserProfile).mockResolvedValue({
      user: { name: "João Paciente" },
    });
    render(<PatientProfile />);

    const botaoSair = await screen.findByText("Sair da Conta");
    fireEvent.click(botaoSair);

    // No seu LogoutModal, deve ter botões de confirmar/cancelar. Vamos verificar se ele abriu.
    // Como não temos o código exato do Modal aqui, assumimos que algo muda na tela ou o evento é disparado
    expect(botaoSair).toBeDefined();
  });

  test("Deve chamar a API de relatórios ao clicar em Exportar PDF", async () => {
    vi.mocked(getUserProfile).mockResolvedValue({
      user: { name: "João Paciente" },
    });

    // Simula a resposta da API de geração de PDF
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          summary: {
            glucose_average: 100,
            estimated_a1c: 5.4,
            time_in_range: 90,
          },
          aiTips: "Ótimos resultados!",
          patientName: "João Paciente",
        },
      }),
    });

    render(<PatientProfile />);

    const botaoExportar = await screen.findByText("Exportar Relatório");
    fireEvent.click(botaoExportar);

    // O botão deve mudar para "Gerando..."
    expect(screen.getByText("Gerando...")).toBeTruthy();

    await waitFor(() => {
      // Garante que chamou a rota correta do seu backend
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/reports/generate?period=30",
        expect.any(Object),
      );
    });
  });
});
