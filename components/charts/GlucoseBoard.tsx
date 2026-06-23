"use client";

import React, { useState } from "react";
import { MdOutlineNightlight } from "react-icons/md";
import {
  buildWeeklyChartDays,
  parseRecordDate,
  recordsForLocalDate,
  startOfLocalDay,
} from "@/lib/date-utils";

interface GlucoseBoardProps {
  records: any[];
}

export default function GlucoseBoard({ records = [] }: GlucoseBoardProps) {
  const [period, setPeriod] = useState<"Diário" | "Semanal" | "Mensal">("Semanal");

  // Cálculos dinâmicos
  // Cálculos dinâmicos baseados no período selecionado
  const getFilteredRecords = () => {
    const now = new Date();
    const startDate = startOfLocalDay(now);

    if (period === "Diário") {
      // startDate já é meia-noite de hoje
    } else if (period === "Semanal") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "Mensal") {
      startDate.setDate(startDate.getDate() - 30);
    }

    return records.filter(r => parseRecordDate(r.created_at) >= startDate);
  };

  // Averages for the summary cards - Always use at least the last 7 days for better context
  const getSummaryAverage = (periodName: string | string[]) => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    const filtered = records.filter(r => {
      const isCorrectPeriod = Array.isArray(periodName) 
        ? periodName.some(p => r.period?.includes(p)) 
        : r.period?.includes(periodName);
      return isCorrectPeriod && parseRecordDate(r.created_at) >= sevenDaysAgo;
    });

    if (filtered.length === 0) return null;
    const sum = filtered.reduce((acc, r) => acc + r.glucose_value, 0);
    return (sum / filtered.length).toFixed(0);
  };

  const avgJejum = getSummaryAverage("Jejum");
  const avgPos = getSummaryAverage(["Pós-Desjejum", "Pós-Prandial", "Pós-Jantar"]);
  const avgSono = getSummaryAverage("dormir");

  // Dados para o gráfico baseados no período selecionado
  const chartData = React.useMemo(() => {
    const todayDate = new Date();

    if (period === "Diário") {
      const todayRecords = recordsForLocalDate(records, todayDate);
      
      return [
        {
          label: "Manhã",
          jejum: todayRecords.find(r => r.period === "Jejum")?.glucose_value || 0,
          pos: todayRecords.find(r => r.period === "Pós-Desjejum")?.glucose_value || 0,
          sono: 0,
        },
        {
          label: "Tarde",
          jejum: todayRecords.find(r => r.period === "Pré-Prandial")?.glucose_value || 0,
          pos: todayRecords.find(r => r.period === "Pós-Prandial")?.glucose_value || 0,
          sono: 0,
        },
        {
          label: "Noite",
          jejum: todayRecords.find(r => r.period === "Pré-Jantar")?.glucose_value || 0,
          pos: todayRecords.find(r => r.period === "Pós-Jantar")?.glucose_value || 0,
          sono: todayRecords.find(r => r.period?.includes("dormir"))?.glucose_value || 0,
        }
      ];
    } 
    else if (period === "Mensal") {
      const data = [];
      for(let i = 29; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - i);
        const dayRecords = recordsForLocalDate(records, targetDate);
        
        // Label só aparece a cada 5 dias para não amontoar
        const label = i % 5 === 0 || i === 0 || i === 29 ? targetDate.getDate().toString().padStart(2, '0') : "";
        
        data.push({
          label: label,
          jejum: dayRecords.find(r => r.period === "Jejum")?.glucose_value || 0,
          pos: dayRecords.find(r => r.period?.includes("Pós"))?.glucose_value || 0,
          sono: dayRecords.find(r => r.period?.includes("dormir"))?.glucose_value || 0,
        });
      }
      return data;
    } 
    else { // Semanal
      return buildWeeklyChartDays(todayDate).map(({ label, date }) => {
        const dayRecords = recordsForLocalDate(records, date);

        return {
          label,
          jejum: dayRecords.find(r => r.period === "Jejum")?.glucose_value || 0,
          pos: dayRecords.find(r => r.period?.includes("Pós"))?.glucose_value || 0,
          sono: dayRecords.find(r => r.period?.includes("dormir"))?.glucose_value || 0,
        };
      });
    }
  }, [period, records]);

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
          <svg viewBox="0 0 700 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Generate Path dynamically */}
            {["jejum", "pos", "sono"].map((type, i) => {
              const colors = ["var(--dc-azul)", "var(--dc-verde)", "var(--dc-roxo)"];
              const spacing = 700 / Math.max(chartData.length, 1);
              
              // Filtramos apenas pontos que possuem valor maior que 0 para não quebrar o gráfico
              const points = chartData
                .map((d, idx) => ({ x: idx * spacing + (spacing / 2), y: d[type as keyof typeof d] as number }))
                .filter(p => p.y > 0)
                .map(p => `${p.x},${getY(p.y)}`);

              if (points.length < 1) return null;

              return (
                <path
                  key={type}
                  d={`M ${points.join(" L ")}`}
                  fill="none"
                  stroke={colors[i]}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* HTML Overlay for Perfect Circles */}
          {["jejum", "pos", "sono"].map((type, i) => {
            const colors = ["var(--dc-azul)", "var(--dc-verde)", "var(--dc-roxo)"];
            return chartData.map((d, idx) => {
              const val = d[type as keyof typeof d] as number;
              if (val === 0) return null;

              const isLastPoint = idx === chartData.length - 1;
              const leftPercent = ((idx + 0.5) / Math.max(chartData.length, 1)) * 100;
              const topPercent = (getY(val) / 300) * 100;

              return (
                <div
                  key={`dot-${type}-${idx}`}
                  className="absolute rounded-full bg-white -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: isLastPoint ? "12px" : "8px",
                    height: isLastPoint ? "12px" : "8px",
                    border: `${isLastPoint ? 3 : 2}px solid ${colors[i]}`,
                    zIndex: 10
                  }}
                />
              );
            });
          })}
        </div>

        {/* X Axis Labels */}
        <div className="relative w-full h-4 mt-2">
          {chartData.map((d, idx) => {
            const percent = ((idx + 0.5) / Math.max(chartData.length, 1)) * 100;
            return (
              <div 
                key={`${d.label}-${idx}`}
                className="absolute flex justify-center -translate-x-1/2"
                style={{ left: `${percent}%` }}
              >
                <span className={`text-[9px] font-bold tracking-widest ${idx === chartData.length - 1 ? "text-azul" : "text-gray-300"}`}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
