"use client";

import React, { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ArticleCard from "@/app/components/ArticleCard";
import { MdAdd, MdTrendingUp } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCommunityPosts, deleteCommunityPost } from "@/services/api";

export default function ProfissionalPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { setIsLoading(false); return; }
    const user = JSON.parse(userStr);

    getCommunityPosts()
      .then((data) => {
        // Filter only posts by this professional
        const myPosts = (data.posts || []).filter((p: any) => p.author_id === user.id);
        setPosts(myPosts);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token || !confirm('Tem certeza que deseja remover esta publicação?')) return;
    try {
      await deleteCommunityPost(id, token);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB] pb-[100px]">
      <Header title="DiabetesCare" variant="home" titleColor="var(--dc-azul)" />

      <main className="flex flex-col px-[33px] gap-8 mt-6">
        {/* Título e Descrição */}
        <div className="flex flex-col gap-2">
          <h1 className="text-texto text-2xl font-bold">Painel</h1>
          <p className="text-cinza-claro-texto">
            Gerencie suas publicações e compartilhe conhecimento com a comunidade.
          </p>
        </div>

        {/* AÇÕES */}
        <div className="flex gap-4">
          {/* AJUSTE AQUI: O href deve ser o caminho da pasta da sua PublishPage */}
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
            {isLoading && (
              <div className="py-8 text-center text-gray-400 text-sm">Carregando publicações...</div>
            )}
            {!isLoading && posts.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-sm">
                Você ainda não publicou nenhum artigo.
              </div>
            )}
            {posts.slice(0, 3).map((post) => (
              <ArticleCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  author: 'Você',
                  date: new Date(post.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
                  image: post.cover_image_url || '',
                  content: [post.content_html],
                }}
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