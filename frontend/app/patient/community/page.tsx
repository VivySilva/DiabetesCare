"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ArticleCard from "../../components/ArticleCard";
import ForumListScreen from "../../components/ForumListScreen";
import NewQuestionScreen from "../../components/NewQuestionScreen";
import { COMMUNITY_POSTS } from "./data";

export default function CommunityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'articles' | 'forum'>('articles');
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

  return (
    <main className="min-h-screen bg-[#F7F9FB] pb-[91px]">
      <Header title="DiabetesCare" titleColor="var(--dc-azul)" variant="home" />

      {/* Tabs Toggle */}
      <div className="px-6 pt-6">
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
        <section className="flex flex-col items-start px-[33px] pt-8 gap-6 w-full">
          <div className="flex flex-col gap-2 w-full">
            <h1 className="text-texto text-2xl font-bold">Comunidade</h1>
            <p className="m-0 text-cinza-claro-texto leading-relaxed">
              Conecte-se com especialistas e compartilhe conhecimentos sobre bem-estar.
            </p>
          </div>

          <div className="flex flex-col gap-5 w-full pb-4">
            {COMMUNITY_POSTS.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : (
        <div className="pt-2">
           <ForumListScreen 
             role="patient" 
             onTopicClick={(id) => router.push(`/patient/forum/${id}`)}
             onCreateClick={() => setIsCreatingQuestion(true)}
           />
        </div>
      )}

      {isCreatingQuestion && (
        <NewQuestionScreen 
          onClose={() => setIsCreatingQuestion(false)}
          onSubmit={(text) => {
            console.log("Nova pergunta:", text);
            setIsCreatingQuestion(false);
          }}
        />
      )}

      <Footer />
    </main>
  );
}
