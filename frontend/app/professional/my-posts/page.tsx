"use client";

import React from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ArticleCard from "@/app/components/ArticleCard";
import { useRouter } from "next/navigation";

export default function MyPostsPage() {
  const router = useRouter();

  const POSTS = [
    {
      id: "1",
      title: "Como controlar a glicemia no dia a dia",
      content: ["Manter uma rotina alimentar equilibrada é essencial para o controle glicêmico..."],
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352",
      author: "Você",
      date: "HOJE",
      category: "Saúde",
    },
    {
      id: "2",
      title: "Exercícios físicos e diabetes: o que você precisa saber",
      content: ["A prática regular de atividades físicas ajuda na sensibilidade à insulina..."],
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
      author: "Você",
      date: "ONTEM",
      category: "Exercícios",
    }
  ];

  const handleEdit = (id: string) => {
    router.push(`/professional/edit-post/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB] pb-[100px]">
      <Header 
        title="Minhas Publicações" 
        variant="page" 
        onIconClick={() => router.push('/professional')} 
      />

      <main className="flex flex-col px-[33px] gap-6 mt-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-texto">Suas publicações</h1>
          <p className="text-cinza-claro-texto">
            Gerencie o conteúdo que você compartilhou com a comunidade.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {POSTS.map((post) => (
            <ArticleCard 
              key={post.id} 
              post={post} 
              isProfessional={true} 
              onEdit={handleEdit}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
