import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

// 1. MOCKS
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => "/rota-falsa"), // <-- Adicionamos isso para o Header não quebrar!
}));

vi.mock("@/services/user/userService", () => ({
  getUserProfile: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

import ProfessionalProfile from "@/app/professional/profile/page";
import { getUserProfile } from "@/services/user/userService";

describe("Tela de Perfil do Profissional", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => "token-falso-123");
  });

  test("Deve renderizar credenciais profissionais (CRM e Especialidade)", async () => {
    vi.mocked(getUserProfile).mockResolvedValue({
      user: {
        name: "Dra. Ana",
        role: "PROFESSIONAL",
        specialty: "Endocrinologia",
        license_number: "12345 - SP",
        clinic_address: "Rua da Cura, 100",
      },
    });

    render(<ProfessionalProfile />);

    const nome = await screen.findByText("Dra. Ana");
    expect(nome).toBeTruthy();

    // Valida os dados exclusivos da classe
    expect(screen.getByText("Endocrinologia")).toBeTruthy();
    expect(screen.getByText("12345 - SP")).toBeTruthy();
    expect(screen.getByText("Rua da Cura, 100")).toBeTruthy();
  });
});
