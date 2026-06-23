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
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [userRole, setUserRole] = useState("patient");

  React.useEffect(() => {
    // Bloqueia a rolagem do corpo da página principal para evitar scroll duplo
    document.body.style.overflow = 'hidden';

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        const role = (userObj.role || "patient").toLowerCase();
        setUserRole(role);
        if (role === "professional") {
          setIsAnonymous(false);
        }
      } catch (e) {
        console.error(e);
      }
    }

    return () => {
      // Restaura a rolagem ao desmontar o componente
      document.body.style.overflow = '';
    };
  }, []);

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
        content: content,
        is_anonymous: isAnonymous
      }, token);
      onSubmit(data.topic);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar tópico.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 left-0 md:left-[260px] bg-[#F8F9FA] z-[100] overflow-y-auto font-sans border-l border-gray-100 flex flex-col">
      <Header
        title="Nova Pergunta"
        variant="page"
        onBackClick={onClose}
      />

      {/* Input Area */}
      <main className="w-full px-8 pt-6 pb-16 flex flex-col flex-1">
        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-4 rounded-3xl w-full max-w-4xl self-center">{error}</div>
        )}
        
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6 mt-4 w-full max-w-4xl self-center">
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

          <div className="flex flex-col gap-2">
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

          {/* Toggle para Anonimato (Apenas se for Paciente) */}
          {userRole !== "professional" && (
            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 shadow-sm">
              <div className="flex flex-col gap-1 pr-4">
                <span className="font-bold text-sm text-texto">Publicar como anônimo</span>
                <span className="text-[11px] text-cinza-claro-texto">
                  Seu nome e foto de perfil ficarão ocultos para outros usuários no fórum.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}

          {/* Botão Publicar dentro do Card */}
          <button
            disabled={!title.trim() || !content.trim() || isLoading}
            onClick={handleCreate}
            className={`w-full py-5 rounded-[24px] font-bold text-base shadow-lg transition-all transform active:scale-[0.98]
              ${!title.trim() || !content.trim() || isLoading 
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"}`}
          >
            {isLoading ? 'Criando...' : 'Publicar no Fórum'}
          </button>
        </div>
      </main>
    </div>
  );
}
