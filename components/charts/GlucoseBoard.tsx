"use client";

import React, { useState, useMemo } from "react";
import { MdTrendingUp, MdTrendingDown, MdOutlineTimeline } from "react-icons/md";
import {
  buildWeeklyChartDays,
  parseRecordDate,
  recordsForLocalDate,
  startOfLocalDay,
} from "@/lib/date-utils";

// 1. Tipagem estruturada
interface GlucoseRecord {
  id?: string | number;
  created_at: string;
  glucose_value: number;
  period?: string; // Informação de cadastro (ex: Jejum, Pós-Almoço, etc.)
}

interface GlucoseBoardProps {
  records: GlucoseRecord[];
}

interface ChartDataPoint {
  xPercent: number; // Posição horizontal no gráfico (0 a 100)
  yValue: number; // Valor real da glicemia
  label: string; // Ex: "14:30" ou "12/05"
  dateObj: Date;
  statusDetails: ReturnType<typeof getGlucoseStatusDetails>;
  originalRecord?: GlucoseRecord; // Registro original com a info de cadastro
  min?: number; // Para visões agregadas (Semanal/Mensal)
  max?: number;
}

// Faixa de referência geral (70 a 180 mg/dL é o padrão geral para tempo no alvo)
const HEALTHY_RANGE = { min: 70, max: 180 };

// Função para determinar o status e cor
const getGlucoseStatusDetails = (value: number) => {
  if (value === 0) return { status: "Sem Dados", color: "#E0E0E0", bg: "bg-gray-100", text: "text-gray-500" };
  if (value < 70) return { status: "Hipoglicemia", color: "#FF6B6B", bg: "bg-red-100", text: "text-red-700" };
  if (value <= 180) return { status: "Na Meta", color: "#4ECDC4", bg: "bg-green-100", text: "text-green-700" };
  if (value <= 250) return { status: "Atenção", color: "#FFE66D", bg: "bg-yellow-100", text: "text-yellow-700" };
  return { status: "Hiperglicemia", color: "#FF4757", bg: "bg-red-100", text: "text-red-700" };
};

export default function GlucoseBoard({ records = [] }: GlucoseBoardProps) {
  const [period, setPeriod] = useState<"Diário" | "Semanal" | "Mensal">("Diário");

  // Cálculos para os cartões de resumo (Últimos 7 dias)
  const summaryStats = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(new Date().getDate() - 7);
    
    const recentRecords = records.filter(r => parseRecordDate(r.created_at) >= sevenDaysAgo);
    
    if (recentRecords.length === 0) return { avg: 0, min: 0, max: 0 };
    
    const values = recentRecords.map(r => r.glucose_value);
    const avg = values.reduce((acc, val) => acc + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg: Math.round(avg), min, max };
  }, [records]);

  // Construção dos dados do gráfico baseado no período
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const todayDate = new Date();

    if (period === "Diário") {
      const todayRecords = recordsForLocalDate(records, todayDate)
        .sort((a, b) => parseRecordDate(a.created_at).getTime() - parseRecordDate(b.created_at).getTime());

      return todayRecords.map(record => {
        const date = parseRecordDate(record.created_at);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        // Calcula a posição X baseada na hora do dia (0h às 24h = 0% a 100%)
        const timeInMinutes = hours * 60 + minutes;
        const xPercent = (timeInMinutes / (24 * 60)) * 100;

        return {
          xPercent,
          yValue: record.glucose_value,
          label: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
          dateObj: date,
          statusDetails: getGlucoseStatusDetails(record.glucose_value),
          originalRecord: record,
        };
      });
    } 
    else if (period === "Mensal") {
      const data: ChartDataPoint[] = [];
      for (let i = 29; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - i);
        const dayRecords = recordsForLocalDate(records, targetDate);
        
        if (dayRecords.length > 0) {
          const values = dayRecords.map(r => r.glucose_value);
          const avgValue = values.reduce((acc, val) => acc + val, 0) / values.length;
          
          data.push({
            xPercent: ((29 - i) / 29) * 100, // Distribui uniformemente os 30 dias
            yValue: Math.round(avgValue),
            label: `${targetDate.getDate().toString().padStart(2, '0')}/${(targetDate.getMonth() + 1).toString().padStart(2, '0')}`,
            dateObj: targetDate,
            statusDetails: getGlucoseStatusDetails(avgValue),
            min: Math.min(...values),
            max: Math.max(...values),
          });
        }
      }
      return data;
    } 
    else { // Semanal
      const days = buildWeeklyChartDays(todayDate);
      return days.map(({ label, date }, index) => {
        const dayRecords = recordsForLocalDate(records, date);
        const values = dayRecords.map(r => r.glucose_value);
        
        const avgValue = values.length > 0 ? values.reduce((acc, val) => acc + val, 0) / values.length : 0;

        return {
          xPercent: (index / (days.length - 1)) * 100,
          yValue: Math.round(avgValue),
          label,
          dateObj: date,
          statusDetails: getGlucoseStatusDetails(avgValue),
          min: values.length > 0 ? Math.min(...values) : undefined,
          max: values.length > 0 ? Math.max(...values) : undefined,
        };
      }).filter(d => d.yValue > 0); // Filtra dias sem dados para não quebrar a linha
    }
  }, [period, records]);

  // Função para converter valor de glicose em Y (altura) no SVG (0 a 400mg/dL)
  const getY = (val: number) => 300 - (val / 400) * 300;

  // Gerador de curva suave (Bézier)
  const getCurvePath = (data: ChartDataPoint[]) => {
    if (data.length === 0) return "";
    if (data.length === 1) return `M ${(data[0].xPercent / 100) * 700},${getY(data[0].yValue)}`;

    let path = `M ${(data[0].xPercent / 100) * 700},${getY(data[0].yValue)}`;
    const tension = 0.3;

    for (let i = 1; i < data.length; i++) {
      const p0 = data[i - 1];
      const p1 = data[i];
      
      const x0 = (p0.xPercent / 100) * 700;
      const y0 = getY(p0.yValue);
      const x1 = (p1.xPercent / 100) * 700;
      const y1 = getY(p1.yValue);

      const cp1x = x0 + (x1 - x0) * tension;
      const cp1y = y0;
      const cp2x = x1 - (x1 - x0) * tension;
      const cp2y = y1;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x1},${y1}`;
    }

    return path;
  };

  // Memoiza uma lista plana cronológica de todos os registros do período selecionado para preencher a tabela
  const tableRecords = useMemo(() => {
    const now = new Date();
    const startDate = startOfLocalDay(now);

    if (period === "Semanal") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "Mensal") {
      startDate.setDate(startDate.getDate() - 30);
    }

    return records
      .filter(r => {
        if (period === "Diário") {
          const d = parseRecordDate(r.created_at);
          return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return parseRecordDate(r.created_at) >= startDate;
      })
      .sort((a, b) => parseRecordDate(b.created_at).getTime() - parseRecordDate(a.created_at).getTime()); // Mais recentes primeiro
  }, [period, records]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full p-4 md:p-8 bg-[#F8F9FA] md:rounded-[32px]">

      {/* CARTÕES DE RESUMO - Inalterados */}
      <div className="flex flex-col gap-4">
        <p className="m-0 text-cinza-claro-texto font-bold text-[11px] uppercase tracking-wider pl-2 md:pl-0">
          Últimos 7 dias
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-azul-claro text-azul rounded-full flex items-center justify-center">
              <MdOutlineTimeline size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-cinza-claro-texto font-bold text-[10px] uppercase">Glicemia Média</span>
              <div className="flex items-baseline gap-1">
                <span className="text-texto font-extrabold text-2xl">{summaryStats.avg || "--"}</span>
                <span className="text-cinza-claro-texto text-[10px]">mg/dL</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <MdTrendingUp size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-cinza-claro-texto font-bold text-[10px] uppercase">Maior Pico</span>
              <div className="flex items-baseline gap-1">
                <span className="text-texto font-extrabold text-2xl">{summaryStats.max || "--"}</span>
                <span className="text-cinza-claro-texto text-[10px]">mg/dL</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
              <MdTrendingDown size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-cinza-claro-texto font-bold text-[10px] uppercase">Menor Valor</span>
              <div className="flex items-baseline gap-1">
                <span className="text-texto font-extrabold text-2xl">{summaryStats.min || "--"}</span>
                <span className="text-cinza-claro-texto text-[10px]">mg/dL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLE DE PERÍODO - Inalterado */}
      <div className="bg-gray-200/50 p-1 rounded-full flex self-center w-full md:w-auto overflow-hidden">
        {["Diário", "Semanal", "Mensal"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            className={`flex-1 md:px-8 py-2.5 text-xs font-bold rounded-full transition-all ${period === p ? "bg-white text-azul shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* GRÁFICO PRINCIPAL - Inalterado */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] p-4 md:p-8 shadow-sm border border-gray-50 flex flex-col gap-6 w-full overflow-hidden">
        
        <div className="flex items-center justify-between">
          <p className="m-0 text-cinza-claro-texto font-bold text-[11px] uppercase tracking-wider">
            Curva de Glicemia
          </p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 opacity-50" />
            <span className="text-[10px] text-cinza-claro-texto font-medium">Meta (70-180)</span>
          </div>
        </div>

        <div className="relative w-full h-[250px] md:h-[350px] mt-2 pr-2 md:pr-0 pl-8">
          
          <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-gray-400 font-bold items-end pr-2 z-0">
            <span>400</span>
            <span>300</span>
            <span>200</span>
            <span>100</span>
            <span>0</span>
          </div>

          <div className="w-full h-full relative z-10">
            <svg viewBox="0 0 700 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <rect 
                x="0" 
                y={getY(180)} 
                width="700" 
                height={getY(70) - getY(180)} 
                fill="#4ECDC4" 
                fillOpacity="0.08" 
                rx="4"
              />
              {[70, 180, 250].map((val) => (
                <line key={val} x1="0" y1={getY(val)} x2="700" y2={getY(val)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
              ))}

              {chartData.length > 0 && (
                <path
                  d={getCurvePath(chartData)}
                  fill="none"
                  stroke="var(--dc-azul, #0070f3)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </svg>

            {chartData.map((d, idx) => (
              <div
                key={`dot-${idx}`}
                className="absolute rounded-full bg-white -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform group hover:scale-125 hover:z-30"
                style={{
                  left: `${d.xPercent}%`,
                  top: `${(getY(d.yValue) / 300) * 100}%`,
                  width: "12px",
                  height: "12px",
                  border: `3px solid ${d.statusDetails.color}`,
                  zIndex: 20
                }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-[11px] px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl flex flex-col items-center">
                  <span className="font-medium text-gray-300">{d.label}</span>
                  <span className="font-extrabold text-base">{d.yValue} mg/dL</span>
                  {period !== "Diário" && d.max !== undefined && d.min !== undefined && (
                    <span className="text-[9px] text-gray-400 mt-0.5">Min: {d.min} | Max: {d.max}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 w-full h-6 transform translate-y-full">
            {period === "Diário" ? (
              [0, 6, 12, 18, 23.99].map((hour) => (
                <div
                  key={`hour-${hour}`}
                  className="absolute flex justify-center -translate-x-1/2 text-[9px] font-bold text-gray-400"
                  style={{ left: `${(hour / 24) * 100}%` }}
                >
                  {Math.floor(hour).toString().padStart(2, "0")}h
                </div>
              ))
            ) : (
              chartData.map((d, idx) => (
                <div
                  key={`label-${idx}`}
                  className="absolute flex justify-center -translate-x-1/2 text-[9px] font-bold text-gray-400"
                  style={{ left: `${d.xPercent}%` }}
                >
                  {d.label}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RELATÓRIO / TABELA DE DADOS - AJUSTADO CONFORME SOLICITADO */}
      {tableRecords.length > 0 && (
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-50 mt-4">
          <p className="m-0 text-cinza-claro-texto font-bold text-[11px] uppercase tracking-wider mb-4">
            Relatório Detalhado ({period})
          </p>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-cinza-claro-texto uppercase tracking-wider">Horário</th>
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-cinza-claro-texto uppercase tracking-wider">Coleta</th>
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-cinza-claro-texto uppercase tracking-wider">Glicemia</th>
                  <th className="text-left py-3 px-3 text-[10px] font-bold text-cinza-claro-texto uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {tableRecords.map((record, idx) => {
                  const date = parseRecordDate(record.created_at);
                  const statusDetails = getGlucoseStatusDetails(record.glucose_value);
                  
                  // Formatação de data/hora limpa e legível
                  const timeString = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
                  const dateString = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
                  const formattedDateTime = period === "Diário" ? timeString : `${dateString} às ${timeString}`;

                  return (
                    <tr key={record.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-3 text-xs text-gray-600 font-semibold">
                        {formattedDateTime}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-gray-500 font-medium">
                        {/* Exibe o período salvo no cadastro (ex: Pré-Prandial, Jejum, etc.) ou '--' se vazio */}
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md border border-gray-200/60 text-[10px] font-bold uppercase tracking-wide">
                          {record.period || "Geral"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-sm font-extrabold text-texto">
                        {record.glucose_value} <span className="text-[10px] font-normal text-gray-400">mg/dL</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusDetails.bg} ${statusDetails.text}`}
                        >
                          {statusDetails.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}