"use client";

import React, { useState } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useRouter } from "next/navigation";
import { MdOutlineImage, MdOutlineCategory, MdSend } from "react-icons/md";

export default function PublishPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Saúde");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    
    // Simulação de publicação
    setTimeout(() => {
      router.push('/professional');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB] pb-[100px]">
      <Header 
        title="Nova Publicação" 
        variant="page" 
        onIconClick={() => router.push('/professional')} 
      />

      <main className="flex flex-col px-6 pt-4 gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-texto text-xl font-bold">Criar Post</h2>
          <p className="text-cinza-claro-texto text-sm">
            Compartilhe seu conhecimento com a comunidade.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Título */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-cinza-claro-texto px-1">Título</label>
            <input
              type="text"
              placeholder="Ex: Como controlar a glicemia no dia a dia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-texto placeholder:text-cinza-claro-fundo focus:ring-2 focus:ring-azul outline-none transition-all shadow-sm"
              required
            />
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-cinza-claro-texto px-1">Categoria</label>
            <div className="relative text-texto">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cinza-claro-fundo pointer-events-none">
                <MdOutlineCategory size={20} />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 text-texto appearance-none focus:ring-2 focus:ring-azul outline-none transition-all shadow-sm cursor-pointer"
              >
                <option value="Saúde">Saúde</option>
                <option value="Nutrição">Nutrição</option>
                <option value="Exercícios">Exercícios</option>
                <option value="Dicas">Dicas</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cinza-claro-fundo">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Imagem (URL) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-cinza-claro-texto px-1">URL da Imagem</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cinza-claro-fundo">
                <MdOutlineImage size={20} />
              </div>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 text-texto placeholder:text-cinza-claro-fundo focus:ring-2 focus:ring-azul outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-cinza-claro-texto px-1">Conteúdo</label>
            <textarea
              placeholder="Escreva aqui o conteúdo da sua publicação..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl p-4 min-h-[200px] text-texto placeholder:text-cinza-claro-fundo focus:ring-2 focus:ring-azul outline-none transition-all shadow-sm resize-none"
              required
            />
          </div>

          {/* Botão Publicar */}
          <button
            type="submit"
            disabled={isPublishing}
            className={`w-full bg-azul hover:bg-azul-escuro text-white font-bold py-4 rounded-3xl shadow-lg shadow-azul-claro flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] mt-4 ${isPublishing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isPublishing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publicando...
              </span>
            ) : (
              <>
                Publicar
                <MdSend size={20} />
              </>
            )}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}