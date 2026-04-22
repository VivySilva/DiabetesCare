"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TbHandMove } from "react-icons/tb";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import SaveButton from "../../../components/SaveButton";

export default function CadastroGlicemia() {
  const router = useRouter();
  const [glucoseValue, setGlucoseValue] = useState(95);
  const [selectedPeriod, setSelectedPeriod] = useState("Jejum");
  const [tookInsulin, setTookInsulin] = useState(true);

  const periods = [
    "Jejum",
    "Pós-Desjejum",
    "Pré-Prandial",
    "Pós-Prandial",
    "Pré-Jantar",
    "Pós-Jantar",
    "Antes de dormir",
  ];

  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header
        title="Glicemia"
        variant="page"
        onIconClick={() => router.back()}
      />

      <section className="flex flex-col items-start px-[33px] pt-6 gap-6 w-full">
        <div className="flex flex-col gap-2 w-full">
          <h1>Glicemia</h1>
          <p className="m-0 text-cinza-claro-texto">
            Registre a sua glicemia diária para um melhor controle.
          </p>
        </div>

        <form
          className="flex flex-col gap-8 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Glicose salva:", glucoseValue);
          }}
        >
          {/* Título da seção */}
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center gap-2">
              <TbHandMove size={24} color="var(--dc-azul)" />
              <h2 className="m-0" style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 16 }}>
                Medições de Glicose
              </h2>
            </div>

            {/* Card do Slider */}
            <div className="flex flex-col p-5 gap-4 w-full bg-[#F2F4F6] rounded-[32px]">
              {/* Header do card */}
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-texto" style={{ fontFamily: "var(--font-inter)", fontSize: 16 }}>
                  Glicose
                </span>
                <div className="bg-azul text-white px-4 py-2 rounded-full font-bold detail2" style={{ fontSize: 14 }}>
                  {glucoseValue} mg/dL
                </div>
              </div>

              {/* Slider nativo customizado */}
              <div className="flex flex-col gap-2 w-full pt-4">
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={glucoseValue}
                  onChange={(e) => setGlucoseValue(Number(e.target.value))}
                  className="w-full h-2 bg-[#D1D5DB] rounded-lg appearance-none cursor-pointer accent-azul touch-none"
                />
                <div className="flex justify-between w-full mt-2">
                  <span className="text-[10px] uppercase text-cinza-claro-texto font-semibold">0 MG/DL</span>
                  <span className="text-[10px] uppercase text-cinza-claro-texto font-semibold">200 MG/DL</span>
                  <span className="text-[10px] uppercase text-cinza-claro-texto font-semibold">400 MG/DL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seleção de Período (Scroll Horizontal) */}
          <div className="flex flex-col gap-4 w-full">
            <span className="font-semibold text-texto" style={{ fontFamily: "var(--font-inter)", fontSize: 16 }}>
              Período
            </span>
            <div className="flex gap-3 overflow-x-auto w-full pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {periods.map((period) => (
                <button
                  type="button"
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-5 py-3 rounded-full detail2 whitespace-nowrap snap-start transition-colors cursor-pointer ${
                    selectedPeriod === period
                      ? "bg-azul text-white font-semibold shadow-sm"
                      : "bg-[#F2F4F6] text-texto"
                  }`}
                  style={{ fontSize: 14 }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Insulina */}
          <div className="flex flex-col p-5 gap-4 w-full bg-[#F2F4F6] rounded-[32px]">
            <span className="font-semibold text-texto" style={{ fontFamily: "var(--font-inter)", fontSize: 16 }}>
              Insulina
            </span>
            <div className="flex items-center justify-center gap-10 w-full pb-2">
              <button
                type="button"
                onClick={() => setTookInsulin(true)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center ${
                    tookInsulin ? "border-azul bg-azul" : "border-azul bg-white"
                  }`}
                >
                  {/* Se quiser um ponto branco no meio do selecionado, descomente abaixo */}
                  {/* {tookInsulin && <div className="w-2.5 h-2.5 bg-white rounded-full" />} */}
                </div>
                <span className="text-texto uppercase tracking-wide" style={{ fontFamily: "var(--font-inter)", fontWeight: 500 }}>
                  SIM
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTookInsulin(false)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center ${
                    !tookInsulin ? "border-azul bg-azul" : "border-azul bg-white"
                  }`}
                >
                  {/* {!tookInsulin && <div className="w-2.5 h-2.5 bg-white rounded-full" />} */}
                </div>
                <span className="text-texto uppercase tracking-wide" style={{ fontFamily: "var(--font-inter)", fontWeight: 500 }}>
                  NÃO
                </span>
              </button>
            </div>
          </div>

          <SaveButton className="mt-4" />
        </form>
      </section>

      <Footer />
    </main>
  );
}
