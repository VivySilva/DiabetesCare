"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { COMMUNITY_POSTS } from "@/app/patient/community/data";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function PostDetail({ id }: { id: string }) {
  const router = useRouter();
  const post = COMMUNITY_POSTS.find((p) => p.id === id);

  // Caso o post não seja encontrado
  if (!post) {
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

  // Verifica se uma linha do conteúdo é um tópico numerado (ex: "1. Algo", "2. Outro")
  const isTopicHeading = (text: string) => /^\d+\./.test(text);
  // Verifica se é um subtítulo (linha curta, sem ponto final, geralmente títulos de seção)
  const isSectionHeading = (text: string) =>
    text.length < 60 && !text.endsWith(".") && !isTopicHeading(text);

  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header
        title="Visualização de postagem"
        variant="page"
      />

      <div className="w-full overflow-hidden" style={{ height: "219.38px", flexShrink: 0 }}>
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

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
              {post.author.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <span
              className="font-semibold text-texto"
              style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: 1.2 }}
            >
              {post.author}
            </span>
            <span
              className="text-cinza-claro-texto"
              style={{ fontFamily: "var(--font-inter)", fontSize: "12px" }}
            >
              Publicado em {post.date}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          {post.content.map((paragraph, i) => {
            if (isTopicHeading(paragraph)) {
              return (
                <h2
                  key={i}
                  className="m-0 text-texto"
                  style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "16px" }}
                >
                  {paragraph}
                </h2>
              );
            }

            if (isSectionHeading(paragraph)) {
              return (
                <h2
                  key={i}
                  className="m-0 text-texto"
                  style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "16px" }}
                >
                  {paragraph}
                </h2>
              );
            }

            return (
              <p
                key={i}
                className="m-0 text-cinza-escuro-texto"
                style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: "1.7" }}
              >
                {paragraph}
              </p>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
