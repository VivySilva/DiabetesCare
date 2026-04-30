"use client";

import React from 'react';
import { MdSearch, MdChatBubbleOutline, MdThumbUp, MdCheckCircle, MdAdd } from 'react-icons/md';

interface ForumListProps {
  onTopicClick: (id: string) => void;
  onCreateClick?: () => void;
  role: 'patient' | 'professional';
}

export default function ForumListScreen({ onTopicClick, onCreateClick, role }: ForumListProps) {
  const TOPICS = [
    {
      id: "1",
      title: "Manejo de Glicemia: Como lidar com picos matinais?",
      preview: "Tenho notado que minha glicemia sobe muito logo após acordar, mesmo sem comer nada. Alguém j...",
      time: "2h atrás",
      replies: 42,
      likes: 128,
      moderated: true,
      users: ["1", "2"]
    },
    {
      id: "2",
      title: "Receitas Low Carb para o Final de Semana",
      preview: "Compartilhem aqui suas melhores dicas de sobremesas que não alteram a curva glicêmica...",
      time: "5h atrás",
      replies: 89,
      likes: 254,
      moderated: true,
      users: ["3", "4"]
    },
    {
      id: "3",
      title: "Exercícios e Diabetes: O que priorizar?",
      preview: "Dúvida frequente: é melhor fazer cardio antes ou depois do treino de força para evitar hipoglicemia?",
      time: "Ontem",
      replies: 15,
      likes: 58,
      moderated: false,
      users: ["5"]
    }
  ];

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar tópicos no fórum..." 
            className="w-full bg-white border border-gray-100 rounded-full py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* List */}
      <main className="px-6 flex-1 space-y-4">
        {TOPICS.map((topic) => (
          <div 
            key={topic.id}
            onClick={() => onTopicClick(topic.id)}
            className="bg-white border border-gray-50 rounded-[32px] p-6 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:border-blue-100"
          >
            <div className="flex justify-between items-center mb-4">
              {topic.moderated ? (
                <span className="flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg tracking-wider uppercase">
                  <MdCheckCircle size={12} className="mr-1" /> Moderado
                </span>
              ) : (
                <div />
              )}
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{topic.time}</span>
            </div>
            <h2 className="font-bold text-gray-900 text-lg leading-tight mb-2">{topic.title}</h2>
            <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed">
              {topic.preview}
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <div className="flex gap-4 text-gray-400 text-[11px] font-bold">
                <span className="flex items-center gap-1.5"><MdChatBubbleOutline size={16} /> {topic.replies}</span>
                <span className="flex items-center gap-1.5"><MdThumbUp size={16} /> {topic.likes}</span>
              </div>
              <div className="flex -space-x-2">
                {topic.users.map(u => (
                   <img key={u} src={`https://i.pravatar.cc/100?img=${u}`} alt="user" className="w-7 h-7 rounded-full border-2 border-white shadow-sm" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* FAB para Paciente */}
      {role === 'patient' && (
        <button 
          onClick={onCreateClick}
          className="fixed bottom-28 right-6 w-14 h-14 bg-azul text-white rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center active:scale-90 transition-all z-40"
        >
          <MdAdd size={32} />
        </button>
      )}
    </div>
  );
}