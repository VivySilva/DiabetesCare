import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, describe, beforeEach } from "vitest";

// 1. MOCKS
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => "/fake-path"),
}));

vi.mock("@/services/glucose/glucoseService", () => ({
  registerGlucose: vi.fn(),
}));

import { registerGlucose } from "@/services/glucose/glucoseService";
import CadastroGlicemia from "@/components/features/glucose/GlucoseRecordForm";

describe("Tela de Registro de Glicemia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("Deve exibir erro se glicemia for <= 0", async () => {
    render(<CadastroGlicemia />);
    
    // Altera o valor da glicose para 0
    const numberInput = screen.getByRole("spinbutton");
    fireEvent.change(numberInput, { target: { value: "0" } });
    
    fireEvent.submit(screen.getByRole("button", { name: /Salvar/i }));

    const mensagemErro = await screen.findByText("O valor da glicemia deve ser maior que zero.");
    expect(mensagemErro).toBeTruthy();
    expect(registerGlucose).not.toHaveBeenCalled();
  });

  test("Deve exibir erro se glicemia for > 600", async () => {
    render(<CadastroGlicemia />);
    
    const numberInput = screen.getByRole("spinbutton");
    fireEvent.change(numberInput, { target: { value: "601" } });
    
    fireEvent.submit(screen.getByRole("button", { name: /Salvar/i }));

    const mensagemErro = await screen.findByText("O valor da glicemia não pode ultrapassar 600 mg/dL.");
    expect(mensagemErro).toBeTruthy();
    expect(registerGlucose).not.toHaveBeenCalled();
  });

  test("Deve mostrar erro se o usuário não estiver logado", async () => {
    // localStorage.clear() já executado
    render(<CadastroGlicemia />);
    
    const numberInput = screen.getByRole("spinbutton");
    fireEvent.change(numberInput, { target: { value: "100" } });
    
    fireEvent.submit(screen.getByRole("button", { name: /Salvar/i }));

    const mensagemErro = await screen.findByText("Você precisa estar logado para salvar registros.");
    expect(mensagemErro).toBeTruthy();
    expect(registerGlucose).not.toHaveBeenCalled();
  });

  test("Deve chamar a API corretamente ao salvar um registro válido", async () => {
    vi.mocked(registerGlucose).mockResolvedValue({ id: "123" });
    localStorage.setItem("token", "fake-token");

    render(<CadastroGlicemia />);
    
    const numberInput = screen.getByRole("spinbutton");
    fireEvent.change(numberInput, { target: { value: "120" } });
    
    // Período
    fireEvent.click(screen.getByText("Pós-Prandial"));

    fireEvent.submit(screen.getByRole("button", { name: /Salvar/i }));

    await waitFor(() => {
      expect(registerGlucose).toHaveBeenCalled();
      expect(screen.getByText("Seu registro de glicemia foi salvo com sucesso e já está no seu histórico.")).toBeTruthy();
    });
  });
});
