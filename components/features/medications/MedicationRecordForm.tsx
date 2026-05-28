"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdSearch, MdOutlineAccessTime, MdOutlineNotificationsActive } from "react-icons/md";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import SaveButton from "@/components/forms/SaveButton";
import { registerMedication } from "@/services/medications/medicationService";
import SuccessModal from "@/components/ui/modals/success-modal";

export default function CadastroRemedios() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("Medicamento Oral");
  const [medicationName, setMedicationName] = useState("");
  const [time, setTime] = useState("08:00");
  const [remind, setRemind] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!medicationName.trim()) {
      setError("Por favor, informe o nome do medicamento.");
      return;
    }

    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Você precisa estar logado para salvar registros.");
      setIsLoading(false);
      return;
    }

    try {
      await registerMedication({
        category: selectedType,
        medication_name: medicationName,
        time: time,
        notify: remind
      }, token);

      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar medicamento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[91px]">
      <Header
        title="Remédios"
        variant="page"
        showNotification={true}
      />

      <section className="flex flex-col items-start px-[33px] pt-6 gap-6 w-full">
        <div className="flex flex-col gap-2 w-full">
          <h1>Novo Medicamento</h1>
          <p className="m-0 text-cinza-claro-texto">
            Mantenha seu tratamento sempre em dia.
          </p>
        </div>

        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-xl w-full">{error}</div>}

        <form
          className="flex flex-col w-full"
          onSubmit={handleSubmit}
        >
          <div
          className="flex flex-col items-start p-6 gap-8 w-full rounded-[32px]"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            boxShadow: "0px -4px 24px rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          >

          <div className="flex flex-col gap-4 w-full">
            <span
              className="uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--dc-azul)",
              }}
            >
              CATEGORIA
            </span>
            <div className="flex flex-wrap gap-2">
              {["Insulina", "Medicamento Oral", "Injetáveis não Insulinicos"].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  className={`px-4 py-2 rounded-full detail transition-colors cursor-pointer ${
                    selectedType === opt
                      ? "bg-azul-claro text-azul-escuro"
                      : "bg-cinza-escuro-fundo text-cinza-escuro-texto"
                  }`}
                  onClick={() => setSelectedType(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <span
              className="uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--dc-azul)",
              }}
            >
              MEDICAMENTO
            </span>
            <div className="flex items-center gap-2">
              <MdSearch size={24} color="var(--dc-cinza-fundo)" />
              <input
                type="text"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                placeholder="Ex: Metformina, Gliclazida..."
                className="w-full bg-transparent outline-none p-0 text-sm text-texto placeholder:text-cinza-claro-fundo"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <span
              className="uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--dc-azul)",
              }}
            >
              HORÁRIO
            </span>
            <div 
              className="flex items-center gap-4 bg-cinza-texto rounded-full px-6 py-4 cursor-pointer"
              onClick={() => {
                const input = document.getElementById("timeInput") as HTMLInputElement;
                if (input && typeof input.showPicker === "function") {
                  try {
                    input.showPicker();
                  } catch (e) {
                    input.focus();
                  }
                } else if (input) {
                  input.focus();
                }
              }}
            >
              <MdOutlineAccessTime size={24} color="var(--dc-azul)" />
              <input
                id="timeInput"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent outline-none p-0 text-texto w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "18px" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <span
              className="uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--dc-azul)",
              }}
            >
              LEMBRETE
            </span>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <MdOutlineNotificationsActive size={24} color="#B45309" />
                <span className="font-semibold text-texto" style={{ fontFamily: "var(--font-inter)" }}>
                  Notificar
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRemind(!remind)}
                className={`w-12 h-7 rounded-full flex items-center p-[2px] transition-colors cursor-pointer ${
                  remind ? "bg-azul" : "bg-cinza-claro-fundo"
                }`}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform ${
                    remind ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        
          </div>
          
          <SaveButton className="mt-[36px]" />
        </form>

        <SuccessModal 
          isOpen={showSuccess} 
          message="Medicamento salvo com sucesso! Já configuramos seu lembrete." 
          onClose={() => {
            setShowSuccess(false);
            router.push("/patient/records");
          }} 
        />
      </section>

      <Footer />
    </main>
  );
}
