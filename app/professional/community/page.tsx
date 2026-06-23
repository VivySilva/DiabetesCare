"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ArticleCard from "@/components/ui/ArticleCard";
import ForumListScreen from "@/components/features/forum/ForumListScreen";
import NewQuestionScreen from "@/components/features/forum/NewQuestionScreen";
import { getCommunityPosts } from "@/services/community/communityService";

export default function ProfessionalCommunityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'articles' | 'forum'>('articles');
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

  useEffect(() => {
    if (activeTab !== 'articles') return;
    getCommunityPosts()
      .then((data) => setPosts(data.posts || []))
      .catch(() => { })
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[91px]">
      <Header title="DiabetesCare" titleColor="var(--dc-azul)" variant="home" />

      {/* Centralized Container with Max Width */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-8 mt-6 flex flex-col w-full">
        {/* Tabs Toggle */}
        <div className="w-full">
          <div className="flex bg-gray-100/50 p-1 rounded-[20px] backdrop-blur-sm border border-white">
            <button 
              onClick={() => setActiveTab('articles')}
              className={`flex-1 py-3 text-sm font-bold rounded-[16px] transition-all ${activeTab === 'articles' ? 'bg-white shadow-sm text-azul' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Artigos
            </button>
            <button 
              onClick={() => setActiveTab('forum')}
              className={`flex-1 py-3 text-sm font-bold rounded-[16px] transition-all ${activeTab === 'forum' ? 'bg-white shadow-sm text-azul' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Fórum
            </button>
          </div>
        </div>

        {activeTab === 'articles' ? (
          <section className="flex flex-col items-start pt-8 gap-6 w-full">
            <div className="flex flex-col gap-2 w-full">
              <h1 className="text-texto text-2xl font-bold">Comunidade</h1>
              <p className="m-0 text-cinza-claro-texto leading-relaxed">
                Veja o que outros profissionais e a comunidade estão compartilhando.
              </p>
            </div>

            {isLoading && (
              <div className="w-full py-8 text-center text-gray-400 text-sm">Carregando artigos...</div>
            )}

            {!isLoading && posts.length === 0 && (
              <div className="w-full py-8 text-center text-gray-400 text-sm">
                Nenhum artigo publicado ainda.
              </div>
            )}

            <div className="flex flex-col gap-5 w-full pb-4">
              {posts.map((post) => (
                <ArticleCard key={post.id} post={{
                  id: post.id,
                  title: post.title,
                  author: post.users?.name || 'Autor',
                  date: new Date(post.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
                  image: post.cover_image_url || '',
                  content: [post.content_html],
                }} isProfessional={true} />
              ))}
            </div>
          </section>
        ) : (
          <div className="pt-2 w-full">
             <ForumListScreen 
               role="professional" 
               onTopicClick={(id) => router.push(`/professional/forum/${id}`)}
               onCreateClick={() => setIsCreatingQuestion(true)}
             />
          </div>
        )}
      </div>

      {isCreatingQuestion && (
        <NewQuestionScreen
          onClose={() => setIsCreatingQuestion(false)}
          onSubmit={(topic) => {
            setIsCreatingQuestion(false);
            router.push(`/professional/forum/${topic.id}`);
          }}
        />
      )}

      <Footer />
    </main>
  );
}
