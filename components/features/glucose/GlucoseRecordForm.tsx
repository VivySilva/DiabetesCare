"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TbHandMove, TbVaccine, TbBone, TbDroplet, TbBattery1, TbEyeOff, TbToolsKitchen2, TbWaveSine } from "react-icons/tb";
import { MdOutlineLocationOn, MdOutlineLightbulb, MdPersonOutline, MdAccessibility, MdPerson, MdCheckCircleOutline } from "react-icons/md";
import { FaDizzy } from "react-icons/fa";
import { LuRuler } from "react-icons/lu";
import { FiMinus, FiPlus } from "react-icons/fi";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import SaveButton from "@/components/forms/SaveButton";
import { registerGlucose } from "@/services/glucose/glucoseService";
import SuccessModal from "@/components/ui/modals/success-modal";

export default function CadastroGlicemia() {
  const router = useRouter();
  const [glucoseValue, setGlucoseValue] = useState(95);
  const [selectedPeriod, setSelectedPeriod] = useState("Jejum");
  const [tookInsulin, setTookInsulin] = useState(true);
  
  // Estados da Insulina Expandida
  const [insulinType, setInsulinType] = useState("Basal");
  const [insulinAmount, setInsulinAmount] = useState(12);
  const [injectionSite, setInjectionSite] = useState("Abdômen");
  
  // Lógica de cores e alertas
  const getStatusColor = () => {
    if (glucoseValue <= 70) return "#F59E0B"; // Laranja para Hipoglicemia
    if (glucoseValue > 180) return "#EF4444"; // Vermelho para Hiperglicemia
    return "var(--dc-azul)"; // Azul padrão
  };

  const getHealthAlert = () => {
    if (glucoseValue <= 70) {
      return {
        title: "Alerta de Hipoglicemia",
        message: "Seu nível de açúcar está baixo. Consuma 15g de carboidratos de absorção rápida e meça novamente em 15 minutos.",
        color: "#F59E0B",
        bg: "#FFFBEB"
      };
    }
    if (glucoseValue >= 250) {
      return {
        title: "Alerta de Hiperglicemia Grave",
        message: "Nível muito elevado. Verifique se há sintomas de cetoacidose e entre em contato com seu médico se necessário.",
        color: "#EF4444",
        bg: "#FEF2F2"
      };
    }
    if (glucoseValue > 180) {
      return {
        title: "Atenção: Glicemia Elevada",
        message: "Seu nível está acima do alvo. Beba água e considere realizar uma atividade leve se autorizado.",
        color: "#EF4444",
        bg: "#FEF2F2"
      };
    }
    return null;
  };

  const healthAlert = getHealthAlert();
  const statusColor = getStatusColor();

  // Estados de Sintomas
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Sem Sintomas"]);
  const [symptomIntensity, setSymptomIntensity] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggleSymptom = (symptom: string) => {
    if (symptom === "Sem Sintomas") {
      setSelectedSymptoms(["Sem Sintomas"]);
      setSymptomIntensity(0);
      return;
    }

    let newSymptoms = selectedSymptoms.filter(s => s !== "Sem Sintomas");
    
    if (newSymptoms.includes(symptom)) {
      newSymptoms = newSymptoms.filter(s => s !== symptom);
    } else {
      newSymptoms = [...newSymptoms, symptom];
    }
    
    setSelectedSymptoms(newSymptoms);
    if (newSymptoms.length === 0) {
      setSelectedSymptoms(["Sem Sintomas"]);
      setSymptomIntensity(0);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações Frontend
    if (glucoseValue <= 0) {
      setError("O valor da glicemia deve ser maior que zero.");
      return;
    }
    if (glucoseValue > 600) {
      setError("O valor da glicemia não pode ultrapassar 600 mg/dL.");
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
      await registerGlucose({
        glucose_value: glucoseValue,
        period: selectedPeriod,
        took_insulin: tookInsulin,
        insulin_type: tookInsulin ? insulinType : undefined,
        insulin_amount: tookInsulin ? insulinAmount : undefined,
        injection_site: tookInsulin ? injectionSite : undefined,
        symptoms: selectedSymptoms,
        symptom_intensity: symptomIntensity
      }, token);

      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar glicemia");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
      <Header
        title="Glicemia"
        variant="page"
        showNotification={true}
      />

      <section className="flex flex-col items-start px-5 md:px-8 pt-5 md:pt-6 gap-5 md:gap-6 w-full max-w-5xl mx-auto">
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-lg md:text-xl">Glicemia</h1>
          <p className="m-0 text-cinza-claro-texto text-sm md:text-base">
            Registre a sua glicemia diária para um melhor controle.
          </p>
        </div>

        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-xl w-full">{error}</div>}

        <form
          className="flex flex-col gap-8 w-full"
          onSubmit={handleSubmit}
        >
          {/* Título da seção */}
          <div className="flex flex-col gap-5 md:gap-6 w-full">
            <div className="flex items-center gap-2">
              <TbHandMove size={22} className="md:w-6 md:h-6 shrink-0" color="var(--dc-azul)" />
              <h2 className="m-0" style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 15 }}>
                Medições de Glicose
              </h2>
            </div>

            {/* Card do Slider */}
            <div className="flex flex-col p-4 md:p-5 gap-4 w-full bg-[#F2F4F6] rounded-[24px] md:rounded-[32px]">
              {/* Header do card */}
              <div className="flex items-center justify-between w-full gap-2">
                <span className="font-semibold text-texto text-sm md:text-base">
                  Glicose
                </span>
                <div 
                  className="flex items-center justify-center px-3 md:px-4 py-1.5 rounded-full font-bold transition-colors duration-300 text-white gap-1 shrink-0" 
                  style={{ fontSize: 13, backgroundColor: statusColor }}
                >
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={glucoseValue}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 0 && val <= 600) setGlucoseValue(val);
                    }}
                    className="bg-transparent text-white text-center font-bold outline-none w-[32px] md:w-[38px] p-0 m-0 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
                  />
                  <span className="text-[11px] md:text-[13px]">mg/dL</span>
                </div>
              </div>

              {/* Slider nativo customizado — track mais alto no mobile para touch */}
              <div className="flex flex-col gap-2 w-full pt-3 md:pt-4">
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={glucoseValue}
                  onChange={(e) => setGlucoseValue(Number(e.target.value))}
                  className="w-full h-3 md:h-2 rounded-lg appearance-none cursor-pointer touch-pan-y
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                             [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full 
                             [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-200
                             [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                  style={{
                    background: `linear-gradient(to right, ${statusColor} ${(glucoseValue / 400) * 100}%, #D1D5DB ${(glucoseValue / 400) * 100}%)`
                  }}
                />
                <div className="flex justify-between w-full mt-1 md:mt-2">
                  <span className="text-[9px] md:text-[10px] uppercase text-cinza-claro-texto font-semibold">0</span>
                  <span className="text-[9px] md:text-[10px] uppercase text-cinza-claro-texto font-semibold">200</span>
                  <span className="text-[9px] md:text-[10px] uppercase text-cinza-claro-texto font-semibold">400</span>
                </div>
              </div>
            </div>

            {/* Alert Message */}
            {healthAlert && (
              <div 
                className="flex items-start gap-3 md:gap-4 p-4 md:p-5 rounded-[20px] md:rounded-[24px] animate-in fade-in slide-in-from-top-2 duration-300"
                style={{ backgroundColor: healthAlert.bg, border: `1px solid ${healthAlert.color}20` }}
              >
                <MdOutlineLightbulb size={20} className="md:w-6 md:h-6 shrink-0 mt-0.5" color={healthAlert.color} />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm" style={{ fontFamily: "var(--font-inter)", color: healthAlert.color }}>
                    {healthAlert.title}
                  </span>
                  <span className="text-xs md:text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter)", color: healthAlert.color }}>
                    {healthAlert.message}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Seleção de Período (Scroll Horizontal) */}
          <div className="flex flex-col gap-4 w-full">
            <span className="font-semibold text-texto" style={{ fontFamily: "var(--font-inter)", fontSize: 16 }}>
              Período
            </span>
            <div className="flex gap-2 md:gap-3 overflow-x-auto w-full pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {periods.map((period) => (
                <button
                  type="button"
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 md:px-5 py-2.5 md:py-3 rounded-full whitespace-nowrap snap-start transition-colors cursor-pointer text-sm md:text-base font-semibold ${
                    selectedPeriod === period
                      ? "bg-azul text-white shadow-sm"
                      : "bg-[#F2F4F6] text-texto"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Insulina */}
          <div className="flex flex-col p-4 md:p-5 gap-4 w-full bg-[#F2F4F6] rounded-[24px] md:rounded-[32px]">
            <span className="font-semibold text-texto text-sm md:text-base">
              Insulina
            </span>
            <div className="flex items-center justify-center gap-8 md:gap-10 w-full pb-2">
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
            <div className="flex flex-col gap-5 md:gap-6 w-full animate-fade-in pb-2 pt-2">
              {/* Cabeçalho da Seção */}
              <div className="flex flex-col gap-2 w-full">
                <h1 className="text-lg md:text-xl">Insulina</h1>
                <p className="m-0 text-cinza-claro-texto text-sm md:text-base">
                  Mantenha seu controle em dia para uma vida mais saudável.
                </p>
              </div>

              {/* Card: Tipo de Insulina */}
              <div className="flex flex-col p-4 md:p-5 gap-4 w-full bg-white rounded-[24px] md:rounded-[32px] border border-[#F2F4F6]" style={{ boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.02)" }}>
                <div className="flex items-center gap-2">
                  <TbVaccine size={20} className="md:w-6 md:h-6 shrink-0" color="var(--dc-azul)" />
                  <span className="font-semibold text-texto text-sm md:text-base">
                    Tipo de Insulina
                  </span>
                </div>
                <div className="flex w-full bg-[#F2F4F6] rounded-full p-1 mt-1">
                  {["Basal", "Rápida"].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setInsulinType(type)}
                      className={`flex-1 py-2.5 md:py-3 rounded-full text-sm md:text-base font-semibold transition-all cursor-pointer ${
                        insulinType === type ? "bg-azul text-white shadow-sm" : "text-texto"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card: Quantidade */}
              <div className="flex flex-col p-4 md:p-5 gap-5 md:gap-6 w-full bg-white rounded-[24px] md:rounded-[32px] border border-[#F2F4F6]" style={{ boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.02)" }}>
                <div className="flex items-center gap-2">
                  <LuRuler size={20} className="md:w-6 md:h-6 shrink-0" color="var(--dc-azul)" />
                  <span className="font-semibold text-texto text-sm md:text-base">
                    Quantidade
                  </span>
                </div>
                
                <div className="flex flex-col items-center justify-center w-full mt-1 md:mt-2">
                  <span className="text-[36px] md:text-[48px] font-bold text-azul leading-none">
                    {insulinAmount}
                  </span>
                  <span className="text-[9px] md:text-[10px] uppercase text-cinza-claro-texto font-bold tracking-widest mt-1 md:mt-2">
                    UNIDADES (UI)
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 md:gap-4 w-full pt-3 md:pt-4">
                  <button 
                    type="button"
                    onClick={() => setInsulinAmount(Math.max(0, insulinAmount - 1))}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F2F4F6] flex items-center justify-center shrink-0 cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <FiMinus size={20} className="md:w-6 md:h-6" color="var(--dc-texto)" />
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={insulinAmount}
                    onChange={(e) => setInsulinAmount(Number(e.target.value))}
                    className="w-full h-3 md:h-2 rounded-lg appearance-none cursor-pointer touch-pan-y
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                               [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full 
                               [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-200"
                    style={{
                      background: `linear-gradient(to right, var(--dc-azul) ${insulinAmount}%, #D1D5DB ${insulinAmount}%)`
                    }}
                  />

                  <button 
                    type="button"
                    onClick={() => setInsulinAmount(Math.min(100, insulinAmount + 1))}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-azul flex items-center justify-center shrink-0 cursor-pointer shadow-md hover:opacity-90 transition-opacity"
                  >
                    <FiPlus size={20} className="md:w-6 md:h-6" color="#FFFFFF" />
                  </button>
                </div>
              </div>

              {/* Card: Local de Aplicação */}
              <div className="flex flex-col p-4 md:p-5 gap-4 w-full bg-white rounded-[24px] md:rounded-[32px] border border-[#F2F4F6]" style={{ boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.02)" }}>
                <div className="flex items-center gap-2">
                  <MdOutlineLocationOn size={18} className="md:w-5 md:h-5" color="var(--dc-azul)" />
                  <span className="font-semibold text-texto text-sm md:text-base">
                    Local de Aplicação
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 w-full mt-1 md:mt-2">
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
                        className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-3 md:p-4 rounded-[16px] md:rounded-[20px] transition-all border-2 cursor-pointer ${
                          isSelected 
                            ? "border-[#BFDBFE] bg-[#EFF6FF]" 
                            : "border-transparent bg-[#F2F4F6]"
                        }`}
                      >
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Icon size={18} className="md:w-5 md:h-5" color={isSelected ? "var(--dc-azul)" : "var(--dc-cinza-escuro-texto)"} />
                        </div>
                        <span className={`text-xs md:text-[13px] font-semibold ${isSelected ? "text-azul" : "text-texto"}`}>
                          {site.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card: Dica de Saúde */}
              <div className="flex items-start gap-3 md:gap-4 w-full p-4 md:p-5 rounded-[20px] md:rounded-[24px]" style={{ backgroundColor: "#FFF7ED" }}>
                <MdOutlineLightbulb size={20} className="md:w-6 md:h-6 shrink-0 mt-0.5" color="#B45309" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[#92400E] text-sm">
                    Dica de Saúde
                  </span>
                  <span className="text-[#92400E] text-xs md:text-sm leading-relaxed">
                    Lembre-se de alternar os locais de aplicação para evitar lipodistrofia.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Seção de Sintomas */}
          <div className="flex flex-col gap-5 md:gap-6 w-full pt-5 md:pt-6 pb-4">
            {/* Cabeçalho */}
            <div className="flex flex-col gap-2 w-full">
              <h1 className="text-lg md:text-xl">Sintomas</h1>
              <p className="m-0 text-cinza-claro-texto text-sm md:text-base">
                Registre o que você está sentindo para um melhor controle.
              </p>
            </div>

            <span className="font-semibold text-texto text-sm md:text-base">
              Como você está se sentindo?
            </span>

            {/* Grid com auto-fill para evitar apertar em telas muito estreitas */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-y-5 md:gap-y-6 gap-x-1 md:gap-x-2 w-full mt-1 md:mt-2">
              {[
                { name: "Sem Sintomas", icon: MdCheckCircleOutline },
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
                    className="flex flex-col items-center justify-start gap-2 cursor-pointer transition-all min-w-0"
                  >
                    <div className={`w-[72px] sm:w-[80px] md:w-[84px] h-[72px] sm:h-[80px] md:h-[84px] rounded-[24px] sm:rounded-[28px] md:rounded-[32px] flex items-center justify-center transition-colors ${
                      isSelected ? "bg-[#E0E7FF]" : "bg-transparent"
                    }`}>
                      <Icon size={24} className="sm:w-[26px] sm:h-[26px] md:w-7 md:h-7" color={isSelected ? "var(--dc-azul)" : "var(--dc-cinza-escuro-texto)"} />
                    </div>
                    <span className={`text-[11px] sm:text-[12px] font-medium text-center leading-tight px-1 ${isSelected ? "text-azul" : "text-texto"}`}>
                      {symptom.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Intensidade - Só mostra se não for "Sem Sintomas" */}
            {!selectedSymptoms.includes("Sem Sintomas") && (
              <div className="flex flex-col gap-3 md:gap-4 w-full pt-4 md:pt-6">
                <span className="font-semibold text-texto text-sm md:text-base">
                  Intensidade do Sintoma
                </span>
                
                <div className="flex flex-col w-full p-4 md:p-6 bg-white rounded-[24px] md:rounded-[32px] border border-[#F2F4F6]" style={{ boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.02)" }}>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={symptomIntensity}
                    onChange={(e) => setSymptomIntensity(Number(e.target.value))}
                    className="w-full h-3 md:h-2 rounded-lg appearance-none cursor-pointer touch-pan-y
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                               [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full 
                               [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-200"
                    style={{
                      background: `linear-gradient(to right, var(--dc-azul) ${(symptomIntensity / 10) * 100}%, #D1D5DB ${(symptomIntensity / 10) * 100}%)`
                    }}
                  />
                  <div className="flex justify-between items-center w-full mt-3 md:mt-4">
                    <span className="text-[9px] md:text-[10px] uppercase text-cinza-claro-texto font-bold tracking-widest">LEVE</span>
                    <span className="text-[20px] md:text-[24px] font-bold text-azul leading-none">{symptomIntensity}</span>
                    <span className="text-[9px] md:text-[10px] uppercase text-cinza-claro-texto font-bold tracking-widest">GRAVE</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <SaveButton className="mt-4" />
        </form>

        <SuccessModal 
          isOpen={showSuccess} 
          message="Seu registro de glicemia foi salvo com sucesso e já está no seu histórico." 
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
