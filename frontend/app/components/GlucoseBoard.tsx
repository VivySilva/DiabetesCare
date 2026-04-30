"use client";

import React, { useState } from "react";
import { MdOutlineNightlight } from "react-icons/md";

export default function GlucoseBoard() {
  const [period, setPeriod] = useState<"Diário" | "Semanal" | "Mensal">("Diário");

  const chartData = [
    { day: "SEG", jejum: 95, pos: 140, sono: 120 },
    { day: "TER", jejum: 90, pos: 135, sono: 115 },
    { day: "QUA", jejum: 110, pos: 160, sono: 130 }, // Peak
    { day: "QUI", jejum: 92, pos: 138, sono: 118 },
    { day: "SEX", jejum: 88, pos: 130, sono: 110 },
    { day: "SÁB", jejum: 94, pos: 145, sono: 125 },
    { day: "DOM", jejum: 91, pos: 136, sono: 120 },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-[342px] mx-auto">
      
      {/* RELATÓRIO DE MÉDIAS */}
      <div className="flex flex-col gap-4">
        <p className="m-0 text-cinza-claro-texto font-bold text-[11px] uppercase tracking-wider">
          Relatório de Médias
        </p>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
            <span className="text-azul font-bold text-[10px] uppercase block mb-2">Jejum</span>
            <div className="flex items-baseline gap-1">
              <span className="text-texto font-extrabold text-2xl">91.3</span>
              <span className="text-cinza-claro-texto text-[10px]">mg/dL</span>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
            <span className="text-azul font-bold text-[10px] uppercase block mb-2">Pós-Prandial</span>
            <div className="flex items-baseline gap-1">
              <span className="text-texto font-extrabold text-2xl">136.1</span>
              <span className="text-cinza-claro-texto text-[10px]">mg/dL</span>
            </div>
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
                <span className="text-texto font-extrabold text-2xl">120.3</span>
                <span className="text-cinza-claro-texto text-[10px]">mg/dL</span>
              </div>
            </div>
          </div>
          <span className="bg-[#F2F4F6] text-[#828282] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Estável
          </span>
        </div>
      </div>

      {/* TOGGLE PERÍODO */}
      <div className="bg-gray-100 p-1 rounded-full flex">
        {["Diário", "Semanal", "Mensal"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${
              period === p ? "bg-azul text-white shadow-md" : "text-gray-400 hover:text-gray-500"
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
            {/* Smooth Lines using cubic bezier */}
            {/* Jejum (Blue) */}
            <path
              d="M 50,220 C 150,220 150,240 250,240 C 350,240 350,180 450,180 C 550,180 550,260 650,260"
              fill="none"
              stroke="var(--dc-azul)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Pós-prandial (Green) */}
            <path
              d="M 50,160 C 150,160 150,200 250,200 C 350,200 350,100 450,100 C 550,100 550,220 650,220"
              fill="none"
              stroke="var(--dc-verde)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Antes de Dormir (Purple) */}
            <path
              d="M 50,190 C 150,190 150,220 250,220 C 350,220 350,140 450,140 C 550,140 550,240 650,240"
              fill="none"
              stroke="var(--dc-roxo)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Points for Wednesday (QUA) */}
            <circle cx="250" cy="240" r="6" fill="white" stroke="var(--dc-azul)" strokeWidth="3" />
            <circle cx="250" cy="200" r="6" fill="white" stroke="var(--dc-verde)" strokeWidth="3" />
            <circle cx="250" cy="220" r="6" fill="white" stroke="var(--dc-roxo)" strokeWidth="3" />
            
            {/* Peak points for Friday (SEX) */}
            <circle cx="450" cy="180" r="6" fill="white" stroke="var(--dc-azul)" strokeWidth="3" />
            <circle cx="450" cy="100" r="6" fill="white" stroke="var(--dc-verde)" strokeWidth="3" />
            <circle cx="450" cy="140" r="6" fill="white" stroke="var(--dc-roxo)" strokeWidth="3" />
          </svg>
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-between px-2 mt-2">
          {chartData.map((d) => (
            <span 
              key={d.day} 
              className={`text-[9px] font-bold tracking-widest ${d.day === "QUA" ? "text-azul" : "text-gray-300"}`}
            >
              {d.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
