"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoMdNotificationsOutline } from "react-icons/io";
import Header from "@/components/ui/Header";
import GlucoseSummary from "@/components/charts/GlucoseSummary";
import GlucoseBoard from "@/components/charts/GlucoseBoard";
import Footer from "@/components/ui/Footer";
import ArticleCard from "@/components/ui/ArticleCard";
import NotificationsScreen from "@/components/features/notifications/NotificationsScreen";
import { getUserProfile } from "@/services/user/userService"
import { getGlucoseRecords } from "@/services/glucose/glucoseService"
import { getCommunityPosts } from "@/services/community/communityService";
import DiabeticaChat from "@/Diabetica/DiabeticaChat";

export default function Home() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState("");
  const [latestGlucose, setLatestGlucose] = useState<any>(null);
  const [allGlucoseRecords, setAllGlucoseRecords] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Busca perfil (essencial para validar sessão)
        try {
          const profileRes = await getUserProfile(token);
          if (profileRes.user) {
            setUserName(profileRes.user.name.split(' ')[0]);
          }
        } catch (e: any) { 
          console.error("Erro perfil/sessão:", e);
          // Se falhar ao buscar o perfil, a sessão provavelmente expirou ou é inválida
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push("/login");
          return;
        }

        // Busca glicemia
        try {
          const glucoseRes = await getGlucoseRecords(token);
          // A API de glicose usa successResponse, que coloca os dados dentro de 'data'
          const records = glucoseRes.data?.records || [];
          if (records.length > 0) {
            setLatestGlucose(records[0]);
            setAllGlucoseRecords(records);
          }
        } catch (e) { console.error("Erro glicemia:", e); }

        // Busca posts
        try {
          const postsRes = await getCommunityPosts();
          setPosts(postsRes.posts?.slice(0, 2) || []);
        } catch (e) { console.error("Erro posts:", e); }

      } catch (err) {
        console.error("Erro geral na home:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[91px] md:pb-12">
      <Header
        title="DiabetesCare"
        titleColor="var(--dc-azul-escuro)"
        variant="home"
        onNotificationClick={() => setShowNotifications(true)}
      />

      {/* Mobile: floating notification overlay */}
      {showNotifications && (
        <div className="fixed inset-0 z-[60]">
          <NotificationsScreen onBack={() => setShowNotifications(false)} />
        </div>
      )}

      {/* Desktop top bar (replaces hidden Header on home variant) */}
      <div className="hidden md:flex items-center justify-between px-8 py-5 sticky top-0 z-50 w-full backdrop-blur-[6px]" style={{ background: 'rgba(247, 249, 251, 0.85)' }}>
        <span className="font-display font-extrabold text-xl text-azul-escuro tracking-tight">DiabetesCare</span>
        <button
          onClick={() => setShowNotifications(true)}
          className="relative flex items-center justify-center text-cinza-fundo hover:opacity-70 transition-opacity"
          aria-label="Notificações"
        >
          <IoMdNotificationsOutline size={26} />
        </button>
      </div>

      {/* Centralized Container with Max Width */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-8 pt-6 pb-12 flex flex-col gap-8">
        
        {/* Title / Greetings Area */}
        <div className="flex flex-col w-full gap-1">
          <h1 className="text-texto text-2xl md:text-3xl font-bold">Olá, {userName || "carregando..."}</h1>
          <p className="text-cinza-claro-texto text-sm">Como está seu controle hoje?</p>
        </div>

        {/* ── ROW 1: Resumo Glicemia | Artigos Recentes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
          
          {/* Resumo de Glicemia */}
          <GlucoseSummary 
            value={latestGlucose?.glucose_value} 
            moment={latestGlucose?.period} 
            status={latestGlucose ? (latestGlucose.glucose_value > 150 ? "Atenção" : "Estável") : undefined} 
          />

          {/* Artigos Recentes */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-5 h-full">
            <div className="flex items-center justify-between w-full">
              <h2 className="m-0 text-texto font-bold text-lg">Artigos Recentes</h2>
              <Link
                href="/patient/community"
                className="no-underline text-azul font-semibold text-xs hover:underline"
              >
                Ver Tudo
              </Link>
            </div>

            <div className="flex flex-col gap-5 w-full">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <ArticleCard key={post.id} post={{
                    id: post.id,
                    title: post.title,
                    author: post.users?.name || 'Autor',
                    date: new Date(post.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
                    image: post.cover_image_url || '',
                    content: [post.content_html],
                  }} />
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">Nenhuma publicação encontrada.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── ROW 2: GlucoseBoard (gráfico + médias detalhadas) ── */}
        <GlucoseBoard records={allGlucoseRecords} />

      </section>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-24 md:bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <span className="text-white text-3xl">🤖</span>
      </button>

      {/* Chat Popover */}
      {showChat && (
        <div className="fixed bottom-40 md:bottom-24 right-6 z-50 w-[90vw] md:w-auto md:min-w-[400px]">
          <div className="relative">
             <button 
               onClick={() => setShowChat(false)} 
               className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-md z-10"
               aria-label="Fechar chat"
             >
               ✕
             </button>
             <DiabeticaChat />
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
