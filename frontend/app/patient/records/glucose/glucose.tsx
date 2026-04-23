"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TbHandMove, TbVaccine, TbBone, TbDroplet, TbBattery1, TbEyeOff, TbToolsKitchen2, TbWaveSine } from "react-icons/tb";
import { MdOutlineLocationOn, MdOutlineLightbulb, MdPersonOutline, MdAccessibility, MdPerson } from "react-icons/md";
import { FaDizzy } from "react-icons/fa";
import { LuRuler } from "react-icons/lu";
import { FiMinus, FiPlus } from "react-icons/fi";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import SaveButton from "../../../components/SaveButton";

export default function CadastroGlicemia() {
  const router = useRouter();
  const [glucoseValue, setGlucoseValue] = useState(95);
  const [selectedPeriod, setSelectedPeriod] = useState("Jejum");
  const [tookInsulin, setTookInsulin] = useState(true);
  
  // Estados da Insulina Expandida
  const [insulinType, setInsulinType] = useState("Basal");
  const [insulinAmount, setInsulinAmount] = useState(12);
  const [injectionSite, setInjectionSite] = useState("Abdômen");

  // Estados de Sintomas
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomIntensity, setSymptomIntensity] = useState(5);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

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
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer touch-none"
                  style={{
                    background: `linear-gradient(to right, var(--dc-azul) ${(glucoseValue / 400) * 100}%, #D1D5DB ${(glucoseValue / 400) * 100}%)`
                  }}
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

          {/* Seção Condicional de Detalhes da Insulina */}
          {tookInsulin && (
            <div className="flex flex-col gap-6 w-full animate-fade-in pb-2 pt-2">
              {/* Cabeçalho da Seção */}
              <div className="flex flex-col gap-2 w-full">
                <h1>Insulina</h1>
                <p className="m-0 text-cinza-claro-texto">
                  Mantenha seu controle em dia para uma vida mais saudável.
                </p>
              </div>

              {/* Card: Tipo de Insulina */}
              <div className="flex flex-col p-5 gap-4 w-full bg-white rounded-[32px] border border-[#F2F4F6]" style={{ boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.02)" }}>
                <div className="flex items-center gap-2">
                  <TbVaccine size={24} color="var(--dc-azul)" />
                  <span className="font-semibold text-texto" style={{ fontFamily: "var(--font-inter)", fontSize: 16 }}>
                    Tipo de Insulina
                  </span>
                </div>
                <div className="flex w-full bg-[#F2F4F6] rounded-full p-1 mt-1">
                  {["Basal", "Rápida"].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setInsulinType(type)}
                      className={`flex-1 py-3 rounded-full detail2 transition-all cursor-pointer ${
                        insulinType === type ? "bg-azul text-white font-semibold shadow-sm" : "text-texto"
                      }`}
                      style={{ fontSize: 14 }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card: Quantidade */}
              <div className="flex flex-col p-5 gap-6 w-full bg-white rounded-[32px] border border-[#F2F4F6]" style={{ boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.02)" }}>
                <div className="flex items-center gap-2">
                  <LuRuler size={24} color="var(--dc-azul)" />
                  <span className="font-semibold text-texto" style={{ fontFamily: "var(--font-inter)", fontSize: 16 }}>
                    Quantidade
                  </span>
                </div>
                
                <div className="flex flex-col items-center justify-center w-full mt-2">
                  <span className="text-[48px] font-bold text-azul leading-none" style={{ fontFamily: "var(--font-inter)" }}>
                    {insulinAmount}
                  </span>
                  <span className="text-[10px] uppercase text-cinza-claro-texto font-bold tracking-widest mt-2">
                    UNIDADES (UI)
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 w-full pt-4">
                  <button 
                    type="button"
                    onClick={() => setInsulinAmount(Math.max(0, insulinAmount - 1))}
                    className="w-12 h-12 rounded-full bg-[#F2F4F6] flex items-center justify-center shrink-0 cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <FiMinus size={24} color="var(--dc-texto)" />
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={insulinAmount}
                    onChange={(e) => setInsulinAmount(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer touch-none"
                    style={{
                      background: `linear-gradient(to right, var(--dc-azul) ${insulinAmount}%, #D1D5DB ${insulinAmount}%)`
                    }}
                  />

                  <button 
                    type="button"
                    onClick={() => setInsulinAmount(Math.min(100, insulinAmount + 1))}
                    className="w-12 h-12 rounded-full bg-azul flex items-center justify-center shrink-0 cursor-pointer shadow-md hover:opacity-90 transition-opacity"
                  >
                    <FiPlus size={24} color="#FFFFFF" />
                  </button>
                </div>
              </div>

              {/* Card: Local de Aplicação */}
              <div className="flex flex-col p-5 gap-4 w-full bg-white rounded-[32px] border border-[#F2F4F6]" style={{ boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.02)" }}>
                <div className="flex items-center gap-2">
                  <MdOutlineLocationOn size={20} color="var(--dc-azul)" />
                  <span className="font-semibold text-texto" style={{ fontFamily: "var(--font-inter)", fontSize: 16 }}>
                    Local de Aplicação
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mt-2">
                  {[
                    { name: "Abdômen", icon: MdPersonOutline },
                    { name: "Coxa", icon: MdAccessibility },
                    { name: "Braço", icon: TbBone },
                    { name: "Glúteo", icon: MdPerson }
                  ].map((site) => {
                    const Icon = site.icon;
                    const isSelected = injectionSite === site.name;
                    return (
                      <button
                        type="button"
                        key={site.name}
                        onClick={() => setInjectionSite(site.name)}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-[20px] transition-all border-2 cursor-pointer ${
                          isSelected 
                            ? "border-[#BFDBFE] bg-[#EFF6FF]" 
                            : "border-transparent bg-[#F2F4F6]"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Icon size={20} color={isSelected ? "var(--dc-azul)" : "var(--dc-cinza-escuro-texto)"} />
                        </div>
                        <span className={`text-[13px] font-semibold ${isSelected ? "text-azul" : "text-texto"}`} style={{ fontFamily: "var(--font-inter)" }}>
                          {site.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card: Dica de Saúde */}
              <div className="flex items-start gap-4 w-full p-5 rounded-[24px]" style={{ backgroundColor: "#FFF7ED" }}>
                <MdOutlineLightbulb size={24} color="#B45309" className="shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[#92400E]" style={{ fontFamily: "var(--font-inter)", fontSize: 14 }}>
                    Dica de Saúde
                  </span>
                  <span className="text-[#92400E]" style={{ fontFamily: "var(--font-inter)", fontSize: 13, lineHeight: "1.4" }}>
                    Lembre-se de alternar os locais de aplicação para evitar lipodistrofia.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Seção de Sintomas */}
          <div className="flex flex-col gap-6 w-full pt-6 pb-4">
            {/* Cabeçalho */}
            <div className="flex flex-col gap-2 w-full">
              <h1>Sintomas</h1>
              <p className="m-0 text-cinza-claro-texto">
                Registre o que você está sentindo para um melhor controle.
              </p>
            </div>

            <span className="font-semibold text-texto" style={{ fontFamily: "var(--font-inter)", fontSize: 16 }}>
              Como você está se sentindo?
            </span>

            <div className="grid grid-cols-3 gap-y-6 gap-x-2 w-full mt-2">
              {[
                { name: "Tontura", icon: FaDizzy },
                { name: "Suor Frio", icon: TbDroplet },
                { name: "Cansaço", icon: TbBattery1 },
                { name: "Visão Turva", icon: TbEyeOff },
                { name: "Fome Excessiva", icon: TbToolsKitchen2 },
                { name: "Tremores", icon: TbWaveSine },
              ].map((symptom) => {
                const Icon = symptom.icon;
                const isSelected = selectedSymptoms.includes(symptom.name);
                return (
                  <button
                    type="button"
                    key={symptom.name}
                    onClick={() => toggleSymptom(symptom.name)}
                    className="flex flex-col items-center justify-start gap-2 cursor-pointer transition-all"
                  >
                    <div className={`w-[84px] h-[84px] rounded-[32px] flex items-center justify-center transition-colors ${
                      isSelected ? "bg-[#E0E7FF]" : "bg-transparent"
                    }`}>
                      <Icon size={28} color={isSelected ? "var(--dc-azul)" : "var(--dc-cinza-escuro-texto)"} />
                    </div>
                    <span className={`text-[12px] font-medium text-center leading-tight px-1 ${isSelected ? "text-azul" : "text-texto"}`} style={{ fontFamily: "var(--font-inter)" }}>
                      {symptom.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Intensidade */}
            <div className="flex flex-col gap-4 w-full pt-6">
              <span className="font-semibold text-texto" style={{ fontFamily: "var(--font-inter)", fontSize: 16 }}>
                Intensidade do Sintoma
              </span>
              
              <div className="flex flex-col w-full p-6 bg-white rounded-[32px] border border-[#F2F4F6]" style={{ boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.02)" }}>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={symptomIntensity}
                  onChange={(e) => setSymptomIntensity(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer touch-none"
                  style={{
                    background: `linear-gradient(to right, var(--dc-azul) ${(symptomIntensity / 10) * 100}%, #D1D5DB ${(symptomIntensity / 10) * 100}%)`
                  }}
                />
                <div className="flex justify-between items-start w-full mt-4">
                  <span className="text-[10px] uppercase text-cinza-claro-texto font-bold tracking-widest mt-1">LEVE</span>
                  <span className="text-[24px] font-bold text-azul leading-none" style={{ fontFamily: "var(--font-inter)" }}>{symptomIntensity}</span>
                  <span className="text-[10px] uppercase text-cinza-claro-texto font-bold tracking-widest mt-1">GRAVE</span>
                </div>
              </div>
            </div>
          </div>

          <SaveButton className="mt-4" />
        </form>
      </section>

      <Footer />
    </main>
  );
}
