"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCommunityPostById } from "@/services/community/communityService";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function PostDetail({ id }: { id: string }) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
        <Header title="Visualização de postagem" variant="page" />
        <section className="flex flex-col items-center justify-center px-[33px] pt-24 gap-4 w-full text-center">
          <div className="w-10 h-10 border-4 border-azul border-t-transparent rounded-full animate-spin" />
          <p className="text-cinza-claro-texto">Carregando postagem...</p>
        </section>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
        <Header title="Visualização de postagem" variant="page" />
        <section className="flex flex-col items-center justify-center px-[33px] pt-24 gap-4 w-full text-center">
          <h1 className="text-texto">Postagem não encontrada</h1>
          <p className="text-cinza-claro-texto">O artigo que você procura não existe ou foi removido.</p>
        </section>
      </main>
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

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
      <Header title="Visualização de postagem" variant="page" />

      {/* Container Centralizado para o Artigo (Sombra e bordas premium no desktop) */}
      <article className="w-full max-w-[60rem] mx-auto bg-white md:mt-3 md:mb-8 md:rounded-[32px] overflow-hidden md:shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-transparent md:border-gray-100/70">
        
        {post.cover_image_url && (
          <div className="w-full border-b border-gray-100/80 overflow-hidden relative">
            <img
              src={post.cover_image_url.includes('|') ? post.cover_image_url.split('|')[0] : post.cover_image_url}
              alt={post.title}
              className="w-full h-auto block"
            />
          </div>
        )}

        {/* Conteúdo do Artigo */}
        <section className="flex flex-col items-start w-full px-6 py-8 md:p-10 gap-6">
          
          {/* Categoria e Título */}
          <div className="flex flex-col gap-3 w-full">
            {post.category && (
              <span className="text-[10px] bg-azul-claro text-azul font-bold px-3 py-1.5 rounded-full uppercase tracking-wider w-fit">
                {post.category}
              </span>
            )}
            <h1 
              className="text-texto m-0 leading-snug font-extrabold tracking-tight" 
              style={{ fontFamily: "var(--font-manrope)", fontSize: "30px" }}
            >
              {post.title}
            </h1>
          </div>

          {/* Linha do Autor (Design limpo com linha divisória) */}
          <div className="flex flex-col w-full gap-4">
            <div className="flex flex-row items-center w-full gap-3">
              <Link
                href={post.users?.role === 'PROFESSIONAL' ? `/profissionais/${post.users?.id}` : '#'}
                onClick={(e) => { if (post.users?.role !== 'PROFESSIONAL') e.preventDefault(); }}
                className={`flex items-center gap-3 ${post.users?.role === 'PROFESSIONAL' ? 'hover:opacity-80 transition-opacity' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-azul-claro flex items-center justify-center shrink-0 overflow-hidden">
                  {authorAvatar ? (
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `<span class="text-azul font-extrabold text-sm" style="font-family:var(--font-inter)">${authorInitial}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span
                      className="text-azul font-extrabold text-sm"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {authorInitial}
                    </span>
                  )}
                </div>
                <div className="flex flex-col" style={{ gap: "2px" }}>
                  <span
                    className="font-bold text-texto text-sm"
                    style={{ fontFamily: "var(--font-inter)", lineHeight: 1.2 }}
                  >
                    {authorName}
                    {post.users?.role === 'PROFESSIONAL' && (
                      <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full align-middle">
                        {post.users?.specialty || 'Especialista'}
                      </span>
                    )}
                  </span>
                  <span
                    className="text-cinza-claro-texto text-[11px] font-medium"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {post.users?.role === 'PROFESSIONAL' && post.users?.license_number
                      ? `${post.users.license_number} · Publicado em ${publishedDate}`
                      : `Publicado em ${publishedDate}`}
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Divisor Fino */}
            <div className="h-[1px] bg-gray-100 w-full" />
          </div>

          {/* Conteúdo de Texto com legibilidade premium */}
          <div
            className="flex flex-col gap-4 w-full text-texto prose prose-slate max-w-none"
            style={{ 
              fontFamily: "var(--font-inter)", 
              fontSize: "16px", 
              lineHeight: "1.85", 
              letterSpacing: "0.01em",
              color: "#334155" // Cor slate-700 para leitura confortável
            }}
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />
        </section>
      </article>

      <Footer />
    </main>
  );
}
