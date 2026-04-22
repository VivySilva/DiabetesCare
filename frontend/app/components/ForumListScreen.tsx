import React from 'react';
import { ArrowLeft, Search, MessageSquare, ThumbsUp, CheckCircle2 } from 'lucide-react';

export default function ForumListScreen() {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen font-sans">
      {/* Header */}
      <header className="flex items-center p-6 pb-2">
        <button className="text-gray-600 hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold ml-2 text-gray-900">Fórum</h1>
      </header>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar tópicos no fórum..." 
            className="w-full bg-gray-50 border border-gray-100 rounded-full py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400"
          />
        </div>
      </div>

      {/* List */}
      <main className="px-6 space-y-4 pb-6">
        
        {/* Post 1 */}
        <div className="border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md tracking-wide">
              <CheckCircle2 size={12} className="mr-1" /> MODERADO POR ESPECIALISTA
            </span>
            <span className="text-xs text-gray-400 font-medium">2h atrás</span>
          </div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight mb-2">Manejo de Glicemia: Como lidar com picos matinais?</h2>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            Tenho notado que minha glicemia sobe muito logo após acordar, mesmo sem comer nada. Alguém j...
          </p>
          <div className="flex justify-between items-center">
            <div className="flex gap-4 text-gray-400 text-xs font-medium">
              <span className="flex items-center gap-1"><MessageSquare size={14} /> 42</span>
              <span className="flex items-center gap-1"><ThumbsUp size={14} /> 128</span>
            </div>
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?img=1" alt="user" className="w-6 h-6 rounded-full border-2 border-white" />
              <img src="https://i.pravatar.cc/100?img=2" alt="user" className="w-6 h-6 rounded-full border-2 border-white" />
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 text-[10px] flex items-center justify-center text-gray-500 font-medium">+15</div>
            </div>
          </div>
        </div>

        {/* Post 2 */}
        <div className="border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md tracking-wide">
              <CheckCircle2 size={12} className="mr-1" /> MODERADO POR ESPECIALISTA
            </span>
            <span className="text-xs text-gray-400 font-medium">5h atrás</span>
          </div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight mb-2">Receitas Low Carb para o Final de Semana</h2>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            Compartilhem aqui suas melhores dicas de sobremesas que não alteram a curva glicêmica...
          </p>
          <div className="flex justify-between items-center">
            <div className="flex gap-4 text-gray-400 text-xs font-medium">
              <span className="flex items-center gap-1"><MessageSquare size={14} /> 89</span>
              <span className="flex items-center gap-1"><ThumbsUp size={14} /> 254</span>
            </div>
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?img=3" alt="user" className="w-6 h-6 rounded-full border-2 border-white" />
              <img src="https://i.pravatar.cc/100?img=4" alt="user" className="w-6 h-6 rounded-full border-2 border-white" />
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 text-[10px] flex items-center justify-center text-gray-500 font-medium">+86</div>
            </div>
          </div>
        </div>

        {/* Post 3 */}
        <div className="border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md tracking-wide">
              <CheckCircle2 size={12} className="mr-1" /> MODERADO POR ESPECIALISTA
            </span>
            <span className="text-xs text-gray-400 font-medium">Ontem</span>
          </div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight mb-2">Exercícios e Diabetes: O que priorizar?</h2>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            Dúvida frequente: é melhor fazer cardio antes ou depois do treino de força para evitar hipoglicemia?
          </p>
          <div className="flex justify-between items-center">
            <div className="flex gap-4 text-gray-400 text-xs font-medium">
              <span className="flex items-center gap-1"><MessageSquare size={14} /> 15</span>
              <span className="flex items-center gap-1"><ThumbsUp size={14} /> 58</span>
            </div>
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?img=5" alt="user" className="w-6 h-6 rounded-full border-2 border-white" />
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 text-[10px] flex items-center justify-center text-gray-500 font-medium">+6</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}