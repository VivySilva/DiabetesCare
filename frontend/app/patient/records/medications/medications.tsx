"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdSearch, MdOutlineAccessTime, MdOutlineNotificationsActive } from "react-icons/md";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import SaveButton from "../../../components/SaveButton";

export default function CadastroRemedios() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("Medicamento Oral");
  const [time, setTime] = useState("08:00");
  const [remind, setRemind] = useState(true);

  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header
        title="Remédios"
        variant="page"
        onIconClick={() => router.back()}
      />

      <section className="flex flex-col items-start px-[33px] pt-6 gap-6 w-full">
        <div className="flex flex-col gap-2 w-full">
          <h1>Novo Medicamento</h1>
          <p className="m-0 text-cinza-claro-texto">
            Mantenha seu tratamento sempre em dia.
          </p>
        </div>

        <form
          className="flex flex-col w-full"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Dados salvos:", { selectedType, time, remind });
            // Futuramente enviaremos os dados para a API aqui
          }}
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
            <div className="flex items-center gap-4 bg-cinza-texto rounded-full px-6 py-4">
              <MdOutlineAccessTime size={24} color="var(--dc-azul)" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent outline-none p-0 text-texto w-full [&::-webkit-calendar-picker-indicator]:hidden"
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
      </section>

      <Footer />
    </main>
  );
}
