"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { MdCheckCircle, MdAdd, MdSend } from 'react-icons/md';
import Header from './Header';

interface ForumPostProps {
  id: string;
  role: 'patient' | 'professional';
}

export default function ForumPostScreen({ id, role }: ForumPostProps) {
  const router = useRouter();
  const isProfessional = role === 'professional';

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col font-sans">
      <Header title="Fórum" variant="page" onIconClick={() => router.back()} />

      {/* Main Content */}
      <main className="flex-1 px-6 overflow-y-auto pb-24 bg-[#F7F9FB]">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 mt-6 leading-tight">
          Manejo de Glicemia: Como lidar com picos matinais?
        </h1>

        <div className="space-y-6">
          {/* Comment 1 */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <img src="https://i.pravatar.cc/100?img=9" alt="Mariana" className="w-9 h-9 rounded-full shadow-sm" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Mariana Costa</h3>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">1 hora atrás</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Eu também sofria muito com isso. Comecei a fazer um pequeno lanche proteico antes de dormir e ajudou a estabilizar a produção de glicose pelo fígado durante a madrugada.
            </p>
          </div>

          {/* Expert Comment */}
          <div className="bg-blue-600 rounded-[36px] p-1 shadow-lg shadow-blue-100">
            <div className="bg-white rounded-[32px] p-6">
              <span className="inline-flex items-center text-[9px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase shadow-sm">
                <MdCheckCircle size={12} className="mr-1" /> Resposta do Especialista
              </span>
              
              <div className="flex items-center gap-4 mb-5">
                <img src="https://i.pravatar.cc/100?img=32" alt="Dra Beatriz" className="w-12 h-12 rounded-2xl border-2 border-blue-50 shadow-sm" />
                <div>
                  <h3 className="text-sm font-bold text-blue-700">Dra. Beatriz Santos</h3>
                  <p className="text-[9px] text-blue-400 font-bold tracking-widest uppercase">Endocrinologista</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed italic font-medium bg-blue-50/40 p-5 rounded-3xl border border-blue-50">
                "O que você descreve é muito comum. Esse aumento matinal geralmente ocorre devido à liberação de hormônios como cortisol e hormônio do crescimento, que sinalizam ao fígado para liberar glicose."
                <br /><br />
                Recomendo monitorar sua glicemia às 3h da manhã para descartar o Efeito Somogyi. Converse com seu médico sobre ajustes.
              </p>
            </div>
          </div>

          {/* Comment 3 */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <img src="https://i.pravatar.cc/100?img=11" alt="Lucas" className="w-9 h-9 rounded-full shadow-sm" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Lucas Fernandes</h3>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">32 min atrás</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              A dica da Dra. Beatriz sobre o teste das 3h da manhã foi o que resolveu meu caso! Descobri que era rebote e não alvorecer.
            </p>
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 pb-10 flex items-center gap-3 z-50">
        <button className="text-gray-400 hover:text-azul transition-colors p-3 bg-gray-50 rounded-2xl">
          <MdAdd size={22} />
        </button>
        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-[24px] flex items-center px-5 py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-50 transition-all">
          <input 
            type="text" 
            placeholder={isProfessional ? "Responder como especialista..." : "Escreva sua resposta..."}
            className="bg-transparent w-full focus:outline-none text-sm text-gray-700 placeholder-gray-400 font-medium"
          />
        </div>
        <button className="bg-azul text-white p-4 rounded-[20px] shadow-lg shadow-blue-100 hover:bg-azul-escuro active:scale-95 transition-all">
          <MdSend size={20} />
        </button>
      </footer>
    </div>
  );
}