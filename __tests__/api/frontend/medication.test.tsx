import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => "/fake-path"),
}));

vi.mock("@/services/medications/medicationService", () => ({
  registerMedication: vi.fn(),
}));

vi.mock("@/services/user/userService", () => ({
  getUserProfile: vi.fn().mockResolvedValue({ name: "Teste", role: "PATIENT" }),
}));

import { registerMedication } from "@/services/medications/medicationService";
import CadastroRemedios from "@/components/features/medications/MedicationRecordForm";

describe("Tela de Registro de Medicamentos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("Deve exibir erro se o nome do medicamento for muito curto ou vazio", async () => {
    render(<CadastroRemedios />);
    
    // Deixando o nome vazio (já está por padrão)
    fireEvent.submit(screen.getByRole("button", { name: /Salvar/i }));

    let mensagemErro = await screen.findByText(/Por favor, informe um nome válido para o medicamento/i);
    expect(mensagemErro).toBeTruthy();
    expect(registerMedication).not.toHaveBeenCalled();

    // Nome curto
    const inputNome = screen.getByPlaceholderText("Ex: Metformina, Gliclazida...");
    fireEvent.change(inputNome, { target: { value: "A" } });
    fireEvent.submit(screen.getByRole("button", { name: /Salvar/i }));

    mensagemErro = await screen.findByText(/Por favor, informe um nome válido para o medicamento/i);
    expect(mensagemErro).toBeTruthy();
  });

  test("Deve chamar a API corretamente ao salvar um registro válido", async () => {
    vi.mocked(registerMedication).mockResolvedValue({ id: "123" });
    localStorage.setItem("token", "fake-token");

    render(<CadastroRemedios />);
    
    const inputNome = screen.getByPlaceholderText("Ex: Metformina, Gliclazida...");
    fireEvent.change(inputNome, { target: { value: "Insulina NPH" } });
    
    // Muda a categoria para Insulina
    fireEvent.click(screen.getByText("Insulina"));

    fireEvent.submit(screen.getByRole("button", { name: /Salvar/i }));

    await waitFor(() => {
      expect(registerMedication).toHaveBeenCalled();
      expect(screen.getByText("Medicamento salvo com sucesso! Já configuramos seu lembrete.")).toBeTruthy();
    });
  });
});
