"use client";

import React from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ArticleCard from "@/app/components/ArticleCard";
import { MdAdd, MdTrendingUp } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfissionalPage() {
  const router = useRouter();
  const POSTS = [
    {
      id: "1",
      title: "Como controlar a glicemia no dia a dia",
      content: ["Manter uma rotina alimentar equilibrada é essencial..."],
      image:
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352",
      author: "Você",
      date: "HOJE",
      category: "Saúde",
    },
  ];


  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB] pb-[100px]">
      <Header title="DiabetesCare" variants="home" titleColor="var(--dc-azul)" />

      <main className="flex flex-col px-[33px] gap-8 mt-6">
        {/* Título e Descrição */}
        <div className="flex flex-col gap-2">
          <h1 className="text-texto">Comunidade</h1>
          <p className="text-cinza-claro-texto">
            Gerencie suas publicações e compartilhe conhecimento com os pacientes.
          </p>
        </div>

        {/* AÇÕES */}
        <div className="flex gap-4">
          <Link
            href="/professional/publish"
            className="flex-1 bg-white rounded-[32px] p-6 flex flex-col items-center text-center gap-3 shadow-sm active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-[#FFF7ED] rounded-2xl flex items-center justify-center text-[#F97316]">
              <MdAdd size={28} />
            </div>

            <div>
              <h3 className="font-bold text-texto text-sm m-0">
                Criar Post
              </h3>
              <span className="text-[10px] text-cinza-claro-texto uppercase">
                Compartilhar
              </span>
            </div>
          </Link>

          <Link
            href="/professional/my-posts"
            className="flex-1 bg-white rounded-[32px] p-6 flex flex-col items-center text-center gap-3 shadow-sm active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center text-[#22C55E]">
              <MdTrendingUp size={28} />
            </div>

            <div>
              <h3 className="font-bold text-texto text-sm m-0">
                Minhas Publicações
              </h3>
              <span className="text-[10px] text-cinza-claro-texto uppercase">
                Gerenciar
              </span>
            </div>
          </Link>
        </div>

        {/* POSTS */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-texto">
              Suas publicações
            </h2>
            <Link href="/professional/my-posts" className="text-azul text-xs font-bold hover:underline">
              Ver todas
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {POSTS.map((post) => (
              <ArticleCard
                key={post.id}
                post={post}
                isProfessional={true}
                onEdit={(id) => router.push(`/professional/edit-post/${id}`)}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}