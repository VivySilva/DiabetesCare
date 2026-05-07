"use client";

import React, { useState } from "react";
import { MdOutlineNightlight } from "react-icons/md";

interface GlucoseBoardProps {
  records: any[];
}

export default function GlucoseBoard({ records = [] }: GlucoseBoardProps) {
  const [period, setPeriod] = useState<"Diário" | "Semanal" | "Mensal">("Diário");

  // Cálculos dinâmicos
  const getAverage = (periodName: string | string[]) => {
    const filtered = records.filter(r => 
      Array.isArray(periodName) 
        ? periodName.includes(r.period) 
        : r.period === periodName
    );
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, r) => acc + r.glucose_value, 0);
    return (sum / filtered.length).toFixed(1);
  };

  const avgJejum = getAverage("Jejum");
  const avgPos = getAverage(["Pós-Desjejum", "Pós-Prandial", "Pós-Jantar"]);
  const avgSono = getAverage("Antes de dormir");

  // Mock de dados para o gráfico baseado nos registros reais (últimos 7 dias)
  const days = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const today = new Date().getDay();
  const sortedDays = [...days.slice(today + 1), ...days.slice(0, today + 1)];

  const chartData = sortedDays.map((dayName, index) => {
    // Busca registros para este dia da semana (simplificado para demonstração)
    // No mundo real, filtraríamos por data exata.
    return {
      day: dayName,
      jejum: records.find(r => r.period === "Jejum")?.glucose_value || 90 + Math.random() * 20,
      pos: records.find(r => r.period.includes("Pós"))?.glucose_value || 130 + Math.random() * 30,
      sono: records.find(r => r.period.includes("dormir"))?.glucose_value || 110 + Math.random() * 20,
    };
  });

  // Função para converter valor de glicose em Y no SVG (0-400 mg/dL -> 300-0 Y)
  const getY = (val: number) => 300 - (val / 400) * 300;

  return (
    <div className="flex flex-col gap-8 w-full">

      {/* RELATÓRIO DE MÉDIAS — 3 colunas no desktop */}
      <div className="flex flex-col gap-4">
        <p className="m-0 text-cinza-claro-texto font-bold text-[11px] uppercase tracking-wider">
          Relatório de Médias
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
            <span className="text-azul font-bold text-[10px] uppercase block mb-2">Jejum</span>
            <div className="flex items-baseline gap-1">
              <span className="text-texto font-extrabold text-2xl">{avgJejum || "--"}</span>
              <span className="text-cinza-claro-texto text-[10px]">mg/dL</span>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
            <span className="text-azul font-bold text-[10px] uppercase block mb-2">Pós-Prandial</span>
            <div className="flex items-baseline gap-1">
              <span className="text-texto font-extrabold text-2xl">{avgPos || "--"}</span>
              <span className="text-cinza-claro-texto text-[10px]">mg/dL</span>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-5 flex items-center justify-between shadow-sm border border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-azul-claro rounded-full flex items-center justify-center text-azul">
                <MdOutlineNightlight size={24} />
              </div>
              <div>
                <span className="text-cinza-claro-texto font-bold text-[10px] uppercase block">Antes de Dormir</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-texto font-extrabold text-2xl">{avgSono || "--"}</span>
                  <span className="text-cinza-claro-texto text-[10px]">mg/dL</span>
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              Number(avgSono) > 150 ? "bg-red-100 text-red-500" : "bg-[#F2F4F6] text-[#828282]"
            }`}>
              {Number(avgSono) > 150 ? "Atenção" : "Estável"}
            </span>
          </div>
        </div>
      </div>

      {/* TOGGLE PERÍODO */}
      <div className="bg-gray-100 p-1 rounded-full flex">
        {["Diário", "Semanal", "Mensal"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${period === p ? "bg-azul text-white shadow-md" : "text-gray-400 hover:text-gray-500"
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* GRÁFICO DE EVOLUÇÃO */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="m-0 text-cinza-claro-texto font-bold text-[11px] uppercase tracking-wider">
            Gráfico de Evolução
          </p>

          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-azul" />
              <span className="text-[10px] text-cinza-claro-texto font-medium">Jejum</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-verde" />
              <span className="text-[10px] text-cinza-claro-texto font-medium">Pós-prandial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-roxo" />
              <span className="text-[10px] text-cinza-claro-texto font-medium">Antes de Dormir</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative h-40 w-full mt-4">
          <svg viewBox="0 0 700 300" className="w-full h-full overflow-visible">
            {/* Generate Path dynamically */}
            {["jejum", "pos", "sono"].map((type, i) => {
              const colors = ["var(--dc-azul)", "var(--dc-verde)", "var(--dc-roxo)"];
              const points = chartData.map((d, idx) => `${idx * 100 + 50},${getY(d[type as keyof typeof d] as number)}`);
              return (
                <path
                  key={type}
                  d={`M ${points.join(" L ")}`}
                  fill="none"
                  stroke={colors[i]}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Points for Today (last point) */}
            {["jejum", "pos", "sono"].map((type, i) => {
              const colors = ["var(--dc-azul)", "var(--dc-verde)", "var(--dc-roxo)"];
              const lastVal = chartData[chartData.length - 1][type as keyof typeof chartData[0]] as number;
              return (
                <circle 
                  key={type}
                  cx="650" 
                  cy={getY(lastVal)} 
                  r="6" 
                  fill="white" 
                  stroke={colors[i]} 
                  strokeWidth="3" 
                />
              );
            })}
          </svg>
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-between px-2 mt-2">
          {chartData.map((d, idx) => (
            <span
              key={d.day}
              className={`text-[9px] font-bold tracking-widest ${idx === chartData.length - 1 ? "text-azul" : "text-gray-300"}`}
            >
              {d.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
