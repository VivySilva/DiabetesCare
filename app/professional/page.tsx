"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ArticleCard from "@/components/ui/ArticleCard";
import { MdAdd, MdTrendingUp } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCommunityPosts, deleteCommunityPost } from "@/services/community/communityService";
import { getUserProfile } from "@/services/user/userService";
import NotificationsScreen from "@/components/features/notifications/NotificationsScreen";

export default function ProfissionalPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        router.push('/login');
        return;
      }

      try {
        // Valida a sessão buscando o perfil
        const profileRes = await getUserProfile(token);
        const user = profileRes.user;
        setUserName(user.name?.split(' ')[0] || "");

        // Busca posts da comunidade
        const data = await getCommunityPosts();
        const myPosts = (data.posts || []).filter((p: any) => p.author_id === user.id);
        setPosts(myPosts);
      } catch (err) {
        console.error("Erro de sessão profissional:", err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [router]);

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
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
      <Header title="DiabetesCare" variant="home" titleColor="var(--dc-azul)" onNotificationClick={() => setShowNotifications(true)} />

      {/* Mobile: floating notification overlay */}
      {showNotifications && (
        <div className="fixed inset-0 z-[60]">
          <NotificationsScreen onBack={() => setShowNotifications(false)} />
        </div>
      )}

      {/* Desktop top bar */}
      <div className="hidden md:flex items-center justify-between sticky top-0 z-50 w-full backdrop-blur-[6px]" style={{ background: 'rgba(247, 249, 251, 0.85)' }}>
        <div className="w-full max-w-5xl mx-auto px-6 md:px-8 py-5 flex items-center justify-between">
          <span className="font-display font-extrabold text-xl text-azul-escuro tracking-tight">DiabetesCare</span>
          <button
            onClick={() => setShowNotifications(true)}
            className="relative flex items-center justify-center text-cinza-fundo hover:opacity-70 transition-opacity"
            aria-label="Notificações"
          >
            <IoMdNotificationsOutline size={26} />
          </button>
        </div>
      </div>

      {/* Centralized Container with Max Width */}
      <main className="w-full max-w-5xl mx-auto px-6 md:px-8 mt-6 pb-12 flex flex-col gap-8">
        
        {/* Title and Description */}
        <div className="flex flex-col gap-1">
          <h1 className="text-texto text-2xl md:text-3xl font-bold">Olá, {userName || "carregando..."}</h1>
          <p className="text-cinza-claro-texto text-sm">
            Gerencie suas publicações e compartilhe conhecimento com a comunidade.
          </p>
        </div>

        {/* Dynamic Inner Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-start">
          
          {/* Left Side: Actions Column */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-texto mb-1">Ações Rápidas</h2>
            
            <div className="flex sm:flex-row lg:flex-col gap-4">
              <Link
                href="/professional/publish"
                className="flex-1 bg-white rounded-[32px] p-6 flex flex-col items-center text-center gap-3 shadow-sm border border-gray-100/50 hover:shadow-md active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 bg-[#FFF7ED] rounded-2xl flex items-center justify-center text-[#F97316]">
                  <MdAdd size={28} />
                </div>

                <div>
                  <h3 className="font-bold text-texto text-sm m-0">
                    Criar Post
                  </h3>
                  <span className="text-[10px] text-cinza-claro-texto uppercase font-bold tracking-wider">
                    Compartilhar
                  </span>
                </div>
              </Link>

              <Link
                href="/professional/my-posts"
                className="flex-1 bg-white rounded-[32px] p-6 flex flex-col items-center text-center gap-3 shadow-sm border border-gray-100/50 hover:shadow-md active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center text-[#22C55E]">
                  <MdTrendingUp size={28} />
                </div>

                <div>
                  <h3 className="font-bold text-texto text-sm m-0">
                    Minhas Publicações
                  </h3>
                  <span className="text-[10px] text-cinza-claro-texto uppercase font-bold tracking-wider">
                    Gerenciar
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Side: Publications Feed */}
          <section className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-texto">
                Suas publicações recentes
              </h2>
              <Link href="/professional/my-posts" className="no-underline text-azul font-semibold text-xs hover:underline">
                Ver Todas
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading && (
                <div className="col-span-2 py-12 text-center text-gray-400 text-sm">Carregando publicações...</div>
              )}
              {!isLoading && posts.length === 0 && (
                <div className="col-span-2 py-12 text-center text-gray-400 text-sm bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm">
                  Você ainda não publicou nenhum artigo.
                </div>
              )}
              {posts.slice(0, 4).map((post) => (
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

        </div>
      </main>

      <Footer />
    </div>
  );
}