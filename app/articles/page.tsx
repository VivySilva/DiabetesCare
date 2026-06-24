"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import ArticleCard from "@/components/ui/ArticleCard";
import { getCommunityPosts } from "@/services/community/communityService";
import { useSmartHomeHref } from "@/lib/hooks/useSmartHomeHref";

const POSTS_PER_PAGE = 12;

export default function ArticlesPage() {
  const logoHref = useSmartHomeHref();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await getCommunityPosts(currentPage, POSTS_PER_PAGE);
        setPosts(res.posts || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } catch (e) {
        console.error("Erro ao buscar artigos:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Gera a lista de números de página para exibir (com ellipsis)
  const getPageNumbers = () => {
    const { totalPages } = pagination;
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Mostra todas as páginas
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col selection:bg-blue-100">
      
      {/* ── HEADER PÚBLICO COM LOGO E OPÇÕES DE ACESSO ── */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-[6px] border-b border-gray-100 shrink-0" style={{ background: 'rgba(247, 249, 251, 0.9)' }}>
        <div className="w-full max-w-5xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <Link href={logoHref} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-azul-escuro rounded-xl flex items-center justify-center shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-extrabold text-xl text-azul-escuro tracking-tight hidden sm:block">
              DiabetesCare
            </span>
          </Link>
          
          <div className="flex gap-2 sm:gap-3 items-center">
            <Link 
              href="/login"
              className="text-azul font-bold px-4 py-2 text-sm rounded-full hover:bg-blue-50 transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/register"
              className="bg-blue-600 text-white px-5 py-2.5 text-sm rounded-full font-bold shadow-sm hover:bg-blue-700 transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <main className="w-full max-w-5xl mx-auto px-6 md:px-8 py-8 md:py-12 flex-1 flex flex-col gap-8">
        
        {/* Navegação de Voltar */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-cinza-claro-texto hover:text-azul transition-colors w-fit font-medium text-sm"
        >
          <IoMdArrowBack size={18} />
          Voltar para o início
        </Link>
        
        {/* Banner Informativo CTA */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Efeito de luz sutil no fundo do card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
          
          <div className="flex flex-col gap-2 flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-azul-escuro tracking-tight">
              Conhecimento que transforma
            </h1>
            <p className="text-cinza-claro-texto text-base md:text-lg max-w-2xl leading-relaxed">
              Explore nossa biblioteca de artigos médicos, dicas de alimentação e bem-estar. 
              Para interagir com a comunidade e salvar seus conteúdos favoritos, faça parte do DiabetesCare.
            </p>
          </div>
          
          <Link 
            href="/register" 
            className="bg-blue-50 text-blue-600 border border-blue-100 px-6 py-3.5 rounded-full font-bold hover:bg-blue-100 transition-colors whitespace-nowrap w-full md:w-auto text-center"
          >
            Fazer parte da comunidade
          </Link>
        </div>

        {/* Grid de Artigos */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-cinza-claro-texto font-medium">Buscando as últimas publicações...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {posts.length > 0 ? (
              posts.map((post) => (
                <ArticleCard key={post.id} href={`/articles/${post.id}`} post={{
                  id: post.id,
                  title: post.title,
                  author: post.users?.name || 'Autor',
                  avatarUrl: post.users?.avatar_url || '',
                  date: new Date(post.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
                  image: post.cover_image_url || '',
                  content: [post.content_html],
                }} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-4">📰</div>
                <h3 className="text-lg font-bold text-azul-escuro">Nenhum artigo publicado</h3>
                <p className="text-gray-500 text-center mt-1">A nossa comunidade ainda não publicou nenhum conteúdo.</p>
              </div>
            )}
          </div>
        )}

        {/* ── PAGINAÇÃO ── */}
        {!isLoading && pagination.totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 pt-4 pb-2" aria-label="Paginação de artigos">
            {/* Botão Anterior */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                pagination.hasPrev
                  ? "bg-white border border-gray-200 text-azul-escuro hover:bg-blue-50 hover:border-blue-200 active:scale-95"
                  : "bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            {/* Números de Página */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, idx) =>
                page === "ellipsis" ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
                      page === currentPage
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                        : "bg-white border border-gray-200 text-azul-escuro hover:bg-blue-50 hover:border-blue-200 active:scale-95"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            {/* Botão Próximo */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                pagination.hasNext
                  ? "bg-white border border-gray-200 text-azul-escuro hover:bg-blue-50 hover:border-blue-200 active:scale-95"
                  : "bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              Próximo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        )}

      </main>

    </div>
  );
}