import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

// 1. MOCKS
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush, back: vi.fn() })),
  usePathname: vi.fn(() => "/professional/profile/edit"),
}));

vi.mock("@/services/user/userService", () => ({
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
}));

import ProfessionalProfileEdit from "@/app/professional/profile/edit/page";
import { getUserProfile, updateUserProfile } from "@/services/user/userService";

describe("Edição de Perfil do Profissional", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => "token-falso-123");

    vi.mocked(getUserProfile).mockResolvedValue({
      user: {
        name: "Dr. Roberto",
        email: "roberto@medico.com",
        role: "PROFESSIONAL",
        specialty: "Endocrinologista",
        license_number: "123456 - RJ",
        cpf: "11122233344",
        clinic_address: "Rua Exemplo, 100",
        phone: "21999999999",
      },
    });
  });

  test("Deve exibir erro se o CRM for apagado", async () => {
    render(<ProfessionalProfileEdit />);
    
    // Aguarda o carregamento dos dados mockados
    const btnSalvar = await screen.findByRole("button", { name: /Salvar Modificações/i });
    
    // Apaga o CRM
    const inputCrm = screen.getByDisplayValue("123456 - RJ");
    fireEvent.change(inputCrm, { target: { value: "" } });
    
    // Tenta salvar
    fireEvent.submit(btnSalvar);
    
    const msgErro = await screen.findByText("O número de registro (CRM/CRN) é obrigatório.");
    expect(msgErro).toBeTruthy();
    expect(updateUserProfile).not.toHaveBeenCalled();
  });

  test("Deve permitir salvar quando as informações forem válidas", async () => {
    vi.mocked(updateUserProfile).mockResolvedValue(true);
    
    render(<ProfessionalProfileEdit />);
    
    const btnSalvar = await screen.findByRole("button", { name: /Salvar Modificações/i });
    
    // Altera o telefone
    const inputTel = screen.getByDisplayValue("21999999999");
    fireEvent.change(inputTel, { target: { value: "21888888888" } });
    
    fireEvent.submit(btnSalvar);
    
    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalled();
    });

    const btnOk = await screen.findByRole("button", { name: /Entendi/i });
    fireEvent.click(btnOk);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/professional/profile");
    });
  });
});
