"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ArticleCard from "@/components/ui/ArticleCard";
import ForumListScreen from "@/components/features/forum/ForumListScreen";
import NewQuestionScreen from "@/components/features/forum/NewQuestionScreen";
import { getCommunityPosts } from "@/services/community/communityService";
import { MdArticle, MdForum, MdPeople, MdTrendingUp, MdSearch, MdArrowForward } from "react-icons/md";

const CATEGORIES = ["Todas", "Saúde Geral", "Nutrição", "Exercícios", "Medicação", "Bem-estar"];

export default function CommunityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'articles' | 'forum'>('articles');
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeTab !== 'articles') return;
    setIsLoading(true);
    getCommunityPosts()
      .then((data) => setPosts(data.posts || []))
      .catch(() => { })
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === "Todas" || post.category === activeCategory;
    const matchesSearch = !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
      <Header title="DiabetesCare" titleColor="var(--dc-azul)" variant="home" />

      {/* ── HERO SECTION WITH GRADIENT ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />
        
        <div className="relative w-full max-w-5xl mx-auto px-6 md:px-8 py-10 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-4 text-white flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/10">
                Comunidade
              </span>
              <span className="bg-emerald-400/20 backdrop-blur-sm text-emerald-200 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-emerald-400/10">
                +{posts.length} Artigos
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Conhecimento que<br className="hidden md:block" /> transforma vidas
            </h1>
            <p className="text-blue-100 text-base md:text-lg max-w-xl leading-relaxed">
              Conecte-se com especialistas, compartilhe experiências e descubra conteúdos 
              que fazem a diferença no seu cuidado com o diabetes.
            </p>
            {/* Stats Row */}
            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-2 text-blue-100">
                <MdPeople size={20} />
                <span className="text-sm font-semibold">Especialistas ativos</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <MdTrendingUp size={20} />
                <span className="text-sm font-semibold">{posts.length} publicações</span>
              </div>
            </div>
          </div>
          
          {/* Decorative icon */}
          <div className="hidden md:flex w-32 h-32 bg-white/10 backdrop-blur-sm rounded-[32px] items-center justify-center border border-white/10 shadow-2xl">
            <MdArticle size={56} className="text-white/80" />
          </div>
        </div>
      </section>

      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 -mt-6 relative z-10">
        {/* ── TABS + SEARCH + FILTERS ── */}
        <div className="px-6 flex flex-col gap-4">
          {/* Tabs Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex bg-white/80 backdrop-blur-sm p-1 rounded-[20px] shadow-lg shadow-black/5 border border-gray-100">
              <button
                onClick={() => setActiveTab('articles')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-[16px] transition-all ${
                  activeTab === 'articles' 
                    ? 'bg-blue-600 shadow-md shadow-blue-200 text-white' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <MdArticle size={18} />
                Artigos
              </button>
              <button
                onClick={() => setActiveTab('forum')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-[16px] transition-all ${
                  activeTab === 'forum' 
                    ? 'bg-blue-600 shadow-md shadow-blue-200 text-white' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <MdForum size={18} />
                Fórum
              </button>
            </div>
          </div>

          {activeTab === 'articles' && (
            <>
              {/* Search Bar */}
              <div className="relative">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar artigos por título..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-6 px-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                      activeCategory === cat
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-blue-200 hover:text-blue-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {activeTab === 'articles' ? (
          <section className="flex flex-col items-start px-6 gap-6 w-full">
            {/* Loading State */}
            {isLoading && (
              <div className="w-full py-12 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm font-medium">Carregando artigos...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredPosts.length === 0 && (
              <div className="w-full py-16 flex flex-col items-center gap-4 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <MdArticle size={32} className="text-blue-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Nenhum artigo encontrado</h3>
                <p className="text-gray-400 text-sm text-center max-w-sm">
                  {searchQuery 
                    ? `Nenhum resultado para "${searchQuery}". Tente termos diferentes.`
                    : "Ainda não há publicações nesta categoria. Volte em breve!"}
                </p>
              </div>
            )}

            {/* Articles Grid */}
            {!isLoading && filteredPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-12">
                {filteredPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <ArticleCard post={{
                      id: post.id,
                      title: post.title,
                      author: post.users?.name || 'Autor',
                      avatarUrl: post.users?.avatar_url || '',
                      date: new Date(post.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
                      image: post.cover_image_url || '',
                      content: [post.content_html],
                      authorId: post.users?.id,
                      authorRole: post.users?.role,
                    }} />
                  </div>
                ))}
              </div>
            )}

            {/* Community CTA Banner */}
            <div className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-[32px] p-8 md:p-10 border border-blue-100/60 mb-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-extrabold text-azul-escuro">Quer compartilhar seu conhecimento?</h3>
                  <p className="text-cinza-claro-texto text-sm max-w-lg">
                    Profissionais de saúde podem publicar artigos e ajudar milhares de pessoas 
                    que convivem com o diabetes.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/register")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-95 whitespace-nowrap"
                >
                  Fazer parte
                  <MdArrowForward size={18} />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="pt-2 px-6">
            <ForumListScreen
              role="patient"
              onTopicClick={(id) => router.push(`/patient/forum/${id}`)}
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
            router.push(`/patient/forum/${topic.id}`);
          }}
        />
      )}

      <Footer />
    </main>
  );
}
