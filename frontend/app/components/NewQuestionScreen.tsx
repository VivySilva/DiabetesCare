"use client";

import React from 'react';
import { MdClose } from 'react-icons/md';

interface NewQuestionProps {
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export default function NewQuestionScreen({ onClose, onSubmit }: NewQuestionProps) {
  const [text, setText] = React.useState("");

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Nova Pergunta</h1>
        </div>
      </header>

      {/* Input Area */}
      <main className="flex-1 px-8 pt-4">
        <textarea
          autoFocus
          placeholder="O que você gostaria de perguntar para a comunidade?"
          className="w-full h-64 bg-gray-50/50 border border-gray-100 rounded-[32px] p-8 text-lg text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none leading-relaxed"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </main>

      {/* Footer */}
      <footer className="p-8 pb-12">
        <button
          disabled={!text.trim()}
          onClick={() => onSubmit(text)}
          className={`w-full py-5 rounded-[24px] font-bold text-white text-base shadow-lg transition-all transform active:scale-[0.98]
            ${!text.trim() ? "bg-gray-200 shadow-none" : "bg-azul hover:bg-azul-escuro shadow-blue-100"}`}
        >
          Criar Fórum
        </button>
      </footer>
    </div>
  );
}
