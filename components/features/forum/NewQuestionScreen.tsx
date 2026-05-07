"use client";

import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import Header from "@/components/ui/Header";
import { createForumTopic } from "@/services/forum/forumService";

interface NewQuestionProps {
  onClose: () => void;
  onSubmit: (topic: { id: string; title: string }) => void;
}

export default function NewQuestionScreen({ onClose, onSubmit }: NewQuestionProps) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Por favor, preencha o título e a sua dúvida.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) { setError('Você precisa estar logado para criar um tópico.'); return; }

    try {
      setIsLoading(true);
      setError('');
      const data = await createForumTopic({ 
        title: title, 
        preview: content
      }, token);
      onSubmit(data.topic);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar tópico.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col font-sans">
      <Header
        title="Nova Pergunta"
        variant="page"
        onBackClick={onClose}
      />

      {/* Input Area */}
      <main className="flex-1 px-8 pt-6 space-y-6 overflow-y-auto">
        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-4 rounded-3xl">{error}</div>
        )}
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            Assunto do Tópico
          </label>
          <input
            autoFocus
            type="text"
            placeholder="Ex: Como controlar a glicemia de manhã?"
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            Sua Dúvida ou Relato
          </label>
          <textarea
            placeholder="Descreva aqui o que você gostaria de compartilhar com a comunidade..."
            className="w-full h-48 bg-gray-50 border border-gray-100 rounded-3xl p-6 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 pb-12 bg-white">
        <button
          disabled={!title.trim() || !content.trim() || isLoading}
          onClick={handleCreate}
          className={`w-full py-5 rounded-[24px] font-bold text-white text-base shadow-lg transition-all transform active:scale-[0.98]
            ${!title.trim() || !content.trim() || isLoading ? "bg-gray-200 shadow-none" : "bg-azul hover:bg-azul-escuro shadow-blue-100"}`}
        >
          {isLoading ? 'Criando...' : 'Publicar no Fórum'}
        </button>
      </footer>
    </div>
  );
}
