"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import { IoMdArrowBack } from "react-icons/io";
import { getCommunityPostById } from "@/services/community/communityService";
import { useSmartHomeHref } from "@/lib/hooks/useSmartHomeHref";

export default function PublicArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await getCommunityPostById(id);
        setPost(res.post || res.data || res);
      } catch (err: any) {
        setError(err.message || "Postagem não encontrada.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // Acompanhamento da progressão da leitura (scrolling)
  useEffect(() => {
    if (isLoading || error) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setReadingProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
        {/* Header Público */}
        <PublicHeader />

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="flex flex-col items-center gap-5 py-24">
            {/* Skeleton Loader Animado */}
            <div className="w-full max-w-[42rem] flex flex-col gap-6">
              <div className="h-4 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-10 w-3/4 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                  <div className="h-2.5 w-36 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-px bg-gray-100 my-2" />
              <div className="space-y-3 mt-2">
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <p className="text-cinza-claro-texto text-sm font-medium mt-2">
              Carregando artigo...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
        <PublicHeader />

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="flex flex-col items-center gap-6 py-24 max-w-md text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-azul-escuro">Artigo não encontrado</h1>
            <p className="text-cinza-claro-texto leading-relaxed">
              O artigo que você está procurando pode ter sido removido ou não existe. 
              Verifique o link ou explore outros conteúdos da nossa comunidade.
            </p>
            <Link
              href="/articles"
              className="mt-2 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <IoMdArrowBack size={18} />
              Ver todos os artigos
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const authorName = post.users?.name || "Autor";
  const authorInitial = authorName.charAt(0);
  const authorAvatar = post.users?.avatar_url || "";
  const publishedDate = new Date(post.created_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const readingTime = estimateReadingTime(post.content_html || "");

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Barra de progresso de leitura */}
      <div className="fixed top-0 left-0 z-[60] w-full h-1 bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-150 ease-out rounded-r-full"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header Público */}
      <PublicHeader />

      {/* Conteúdo do Artigo */}
      <main className="flex-1 w-full max-w-[42rem] mx-auto px-5 sm:px-8 py-8 md:py-12">
        {/* Navegação de Voltar */}
        <nav className="mb-8">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-cinza-claro-texto hover:text-azul transition-colors text-sm font-medium group"
          >
            <IoMdArrowBack size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar para artigos
          </Link>
        </nav>

        <article>
          {/* Cabeçalho do Artigo */}
          <header className="flex flex-col gap-5 mb-10">
            {post.category && (
              <span
                className="text-[11px] bg-blue-50 text-blue-700 font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider w-fit border border-blue-100"
              >
                {post.category}
              </span>
            )}

            <h1
              className="text-azul-escuro m-0 leading-[1.2] font-extrabold tracking-tight"
              style={{
                fontFamily: "var(--font-manrope)",
                fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
              }}
            >
              {post.title}
            </h1>

            {/* Meta: Autor e Data */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-cinza-claro-texto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-azul-claro flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
                  {authorAvatar ? (
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `<span class="text-azul font-extrabold text-sm">${authorInitial}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-azul font-extrabold text-sm">{authorInitial}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-texto text-sm leading-tight">{authorName}</span>
                  <span className="text-xs text-cinza-claro-texto">
                    {publishedDate}
                    {readingTime && <span> · {readingTime} min de leitura</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-gray-100 via-blue-100/50 to-gray-100 w-full" />
          </header>

          {/* Imagem de Capa */}
          {post.cover_image_url && (
            <div className="w-full mb-10 rounded-2xl overflow-hidden shadow-sm border border-gray-100/80">
              <img
                src={post.cover_image_url.includes("|") ? post.cover_image_url.split("|")[0] : post.cover_image_url}
                alt={post.title}
                className="w-full h-auto block"
                loading="eager"
              />
            </div>
          )}

          {/* Conteúdo com tipografia refinada para leitura longa */}
          <div
            className="prose prose-slate max-w-none"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "17px",
              lineHeight: "1.85",
              letterSpacing: "0.01em",
              color: "#1e293b",
            }}
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />

          {/* Banner CTA ao final do artigo */}
          <div className="mt-16 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-[24px] p-8 md:p-10 border border-blue-100/60 text-center">
            <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
              <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-azul-escuro">Gostou do conteúdo?</h3>
              <p className="text-cinza-claro-texto text-sm leading-relaxed">
                Crie sua conta gratuita para interagir com a comunidade, salvar seus artigos favoritos 
                e receber conteúdos personalizados sobre diabetes e bem-estar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                >
                  Criar Conta Grátis
                </Link>
                <Link
                  href="/login"
                  className="bg-white text-azul-escuro border border-gray-200 px-8 py-3.5 rounded-full font-bold hover:bg-gray-50 transition-colors"
                >
                  Fazer Login
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>

    </div>
  );
}

/**
 * Componente de Header Público com logo e botões de login/cadastro.
 * Extraído para evitar repetição de código entre estados de carregamento e sucesso.
 */
function PublicHeader() {
  const logoHref = useSmartHomeHref();
  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-[8px] border-b border-gray-100/80 shrink-0"
      style={{ background: "rgba(247, 249, 251, 0.92)" }}
    >
      <div className="w-full max-w-5xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href={logoHref} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group">
          <div className="w-9 h-9 bg-azul-escuro rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-extrabold text-lg text-azul-escuro tracking-tight hidden sm:block">
            DiabetesCare
          </span>
        </Link>

        <div className="flex gap-2 sm:gap-3 items-center">
          <Link
            href="/login"
            className="text-azul font-bold px-4 py-2 text-sm rounded-full hover:bg-blue-50/70 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-5 py-2.5 text-sm rounded-full font-bold shadow-sm hover:bg-blue-700 transition-colors active:scale-[0.97]"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * Estima o tempo de leitura com base no número de palavras do conteúdo HTML.
 * Retorna o número aproximado de minutos, ou null se não houver conteúdo.
 */
function estimateReadingTime(html: string): number | null {
  if (!html) return null;
  const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (!text) return null;
  const wordCount = text.split(" ").length;
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return minutes;
}
