import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush, back: vi.fn() })),
  usePathname: vi.fn(() => "/professional/notifications"),
}));

vi.mock("@/services/notifications/notificationService", () => ({
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

// Notifications Screen is shared but we test the route
import ProfessionalNotificationsPage from "@/app/professional/notifications/page";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/services/notifications/notificationService";

describe("Notificações do Profissional", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => "token-falso-123");
  });

  test("Deve listar notificações e permitir marcá-las como lidas", async () => {
    vi.mocked(getNotifications).mockResolvedValue({
      notifications: [
        {
          id: "n1",
          type: "SYSTEM",
          title: "Novo artigo publicado",
          body: "Seu artigo foi aprovado.",
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: "n2",
          type: "APPOINTMENT",
          title: "Nova Dúvida no Fórum",
          body: "Um paciente fez uma pergunta.",
          read: true, // Já lida
          created_at: new Date().toISOString(),
        },
        {
          id: "n3",
          type: "SYSTEM",
          title: "Aviso do Sistema",
          body: "Manutenção programada.",
          read: false,
          created_at: new Date().toISOString(),
        }
      ]
    });

    vi.mocked(markNotificationRead).mockResolvedValue(true);
    vi.mocked(markAllNotificationsRead).mockResolvedValue(true);

    render(<ProfessionalNotificationsPage />);

    // Verifica que carregou ambas
    const n1 = await screen.findByText("Novo artigo publicado");
    expect(n1).toBeTruthy();
    expect(screen.getByText("Nova Dúvida no Fórum")).toBeTruthy();

    // Testa "Marcar como lida" unitária
    const btnLida = screen.getAllByText("Marcar como lida")[0];
    fireEvent.click(btnLida);

    await waitFor(() => {
      expect(markNotificationRead).toHaveBeenCalledWith("n1", "token-falso-123");
    });

    // Como n1 estava "Não Lida" (Nas Novas) e tem botão Marcar como Lida, e o cabeçalho tem o botão "Marcar todas"
    const btnTodas = screen.getByText("Marcar todas");
    fireEvent.click(btnTodas);

    await waitFor(() => {
      expect(markAllNotificationsRead).toHaveBeenCalledWith("token-falso-123");
    });
  });
});
