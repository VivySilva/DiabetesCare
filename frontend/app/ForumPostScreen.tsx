import React from 'react';
import { ArrowLeft, CheckCircle2, Plus, Send } from 'lucide-react';

export default function ForumPostScreen() {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center p-6 pb-4">
        <button className="text-gray-600 hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold ml-2 text-gray-900">Fórum</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 overflow-y-auto pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
          Manejo de Glicemia: Como lidar com picos matinais?
        </h1>

        <div className="space-y-6">
          {/* Comment 1 */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <img src="https://i.pravatar.cc/100?img=9" alt="Mariana" className="w-8 h-8 rounded-full" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Mariana Costa</h3>
                <p className="text-[10px] text-gray-400 font-medium">1 hora atrás</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Eu também sofria muito com isso. Comecei a fazer um pequeno lanche proteico antes de dormir e ajudou a estabilizar a produção de glicose pelo fígado durante a madrugada.
            </p>
          </div>

          {/* Expert Comment */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-1 shadow-sm">
            <div className="bg-white rounded-xl p-4">
              <span className="inline-flex items-center text-[10px] font-bold text-white bg-blue-600 px-2 py-1 rounded-md mb-4 tracking-wide">
                <CheckCircle2 size={12} className="mr-1" /> RESPOSTA DO ESPECIALISTA
              </span>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <img src="https://i.pravatar.cc/100?img=32" alt="Dra Beatriz" className="w-10 h-10 rounded-full" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-700">Dra. Beatriz Santos</h3>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed italic font-medium">
                O que você descreve é muito comum. Esse aumento matinal geralmente ocorre devido à liberação de hormônios como cortisol e hormônio do crescimento, que sinalizam ao fígado para liberar glicose.
                <br /><br />
                Recomendo monitorar sua glicemia às 3h da manhã por alguns dias para descartar o Efeito Somogyi. Converse com seu médico sobre ajustar o horário da sua insulina basal ou fracionar a dose noturna. Estamos juntos nessa jornada!
              </p>
            </div>
          </div>

          {/* Comment 3 */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <img src="https://i.pravatar.cc/100?img=11" alt="Lucas" className="w-8 h-8 rounded-full" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Lucas Fernandes</h3>
                <p className="text-[10px] text-gray-400 font-medium">32 min atrás</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              A dica da Dra. Beatriz sobre o teste das 3h da manhã foi o que resolveu meu caso! Descobri que era rebote e não alvorecer.
            </p>
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 p-4 pb-6 flex items-center gap-3">
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 border border-gray-300 rounded-full">
          <Plus size={18} />
        </button>
        <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2">
          <input 
            type="text" 
            placeholder="Escreva sua resposta..." 
            className="bg-transparent w-full focus:outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
        <button className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-colors">
          <Send size={16} />
        </button>
      </footer>
    </div>
  );
}