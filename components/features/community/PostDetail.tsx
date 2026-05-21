"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
        setPost(res.post);
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
      <main className="min-h-screen bg-white pb-[91px]">
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
      <main className="min-h-screen bg-white pb-[91px]">
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
  const publishedDate = new Date(post.created_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header title="Visualização de postagem" variant="page" />

      {post.cover_image_url && (
        <div className="w-full overflow-hidden" style={{ height: "219.38px", flexShrink: 0 }}>
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <section
        className="flex flex-col items-start pb-8 w-full"
        style={{ padding: "24px 24px 32px", gap: "24px" }}
      >
        <h1 className="text-texto m-0 leading-snug" style={{ fontSize: "22px" }}>
          {post.title}
        </h1>

        <div
          className="flex flex-row items-center w-full"
          style={{
            padding: "16px",
            gap: "16px",
            background: "#F2F4F6",
            borderRadius: "32px",
            minHeight: "80px",
          }}
        >
          <div className="w-12 h-12 rounded-full bg-azul-claro flex items-center justify-center shrink-0">
            <span
              className="text-azul font-bold"
              style={{ fontFamily: "var(--font-inter)", fontSize: "16px" }}
            >
              {authorInitial}
            </span>
          </div>
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <span
              className="font-semibold text-texto"
              style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: 1.2 }}
            >
              {authorName}
            </span>
            <span
              className="text-cinza-claro-texto"
              style={{ fontFamily: "var(--font-inter)", fontSize: "12px" }}
            >
              Publicado em {publishedDate}
            </span>
          </div>
        </div>

        <div
          className="flex flex-col gap-4 w-full text-cinza-escuro-texto prose prose-sm max-w-none"
          style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: "1.7" }}
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />
      </section>

      <Footer />
    </main>
  );
}
