"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ArticleCard from "@/components/ui/ArticleCard";
import { useRouter } from "next/navigation";
import { getCommunityPosts } from "@/services/community/communityService";
import { getUserProfile } from "@/services/user/userService";

export default function MyPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [profileRes, postsRes] = await Promise.all([
          getUserProfile(token),
          getCommunityPosts(),
        ]);
        const userId = profileRes.user.id;
        const myPosts = (postsRes.posts || []).filter(
          (p: any) => p.author_id === userId
        );
        setPosts(myPosts);
      } catch (err) {
        console.error("Erro ao buscar suas publicações:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPosts();
  }, [router]);

  const handleEdit = (id: string) => {
    router.push(`/professional/edit-post/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB] pb-[100px]">
      <Header 
        title="Minhas Publicações" 
        variant="page" 
        onBackClick={() => router.push('/professional')} 
      />

      <main className="flex flex-col px-[33px] gap-6 mt-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-texto">Suas publicações</h1>
          <p className="text-cinza-claro-texto">
            Gerencie o conteúdo que você compartilhou com a comunidade.
          </p>
        </div>

        {isLoading && (
          <div className="w-full py-8 text-center text-gray-400 text-sm">Carregando publicações...</div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="w-full py-8 text-center text-gray-400 text-sm bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm">
            Você ainda não publicou nenhum artigo.
          </div>
        )}

        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <ArticleCard 
              key={post.id} 
              post={{
                id: post.id,
                title: post.title,
                author: 'Você',
                date: new Date(post.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
                image: post.cover_image_url || '',
                content: [post.content_html],
              }}
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
