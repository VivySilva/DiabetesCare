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
import MedicationsModal from "@/components/features/medications/MedicationsModal";
import { getUserProfile } from "@/services/user/userService"
import { getGlucoseRecords } from "@/services/glucose/glucoseService"
import { getCommunityPosts } from "@/services/community/communityService";
import { httpClient } from "@/lib/httpClient";
import { useSmartHomeHref } from "@/lib/hooks/useSmartHomeHref";

export default function Home() {
  const router = useRouter();
  const logoHref = useSmartHomeHref();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMedications, setShowMedications] = useState(false);
  const [userName, setUserName] = useState("");
  const [latestGlucose, setLatestGlucose] = useState<any>(null);
  const [allGlucoseRecords, setAllGlucoseRecords] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
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

        // Busca Notificações
        try {
          const { getNotifications } = await import('@/services/notifications/notificationService');
          const notifRes = await getNotifications(token);
          const notifs = notifRes.data?.notifications || notifRes.notifications || [];
          setUnreadNotifications(notifs.filter((n: any) => !n.read).length);
        } catch (e) { console.error("Erro notificações:", e); }

        // Busca Remédios para monitoramento
        try {
          const medsRes = await httpClient.get("/medications", token);
          setMedications(medsRes.records || []);
        } catch (e) { console.error("Erro remédios:", e); }

      } catch (err) {
        console.error("Erro geral na home:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12 min-w-0 overflow-x-hidden">
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
      <div className="hidden md:flex items-center justify-between sticky top-0 z-50 w-full backdrop-blur-[6px]" style={{ background: 'rgba(247, 249, 251, 0.85)' }}>
        <div className="w-full max-w-5xl mx-auto px-6 md:px-8 py-5 flex items-center justify-between">
          <Link href={logoHref} className="font-display font-extrabold text-xl text-azul-escuro tracking-tight no-underline">DiabetesCare</Link>
          <button
            onClick={() => setShowNotifications(true)}
            className="relative flex items-center justify-center text-cinza-fundo hover:opacity-70 transition-opacity"
            aria-label="Notificações"
          >
            <IoMdNotificationsOutline size={26} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Centralized Container with Max Width */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-8 pt-6 pb-12 flex flex-col gap-8 min-w-0">

        {/* Title / Greetings Area */}
        <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-texto text-2xl md:text-3xl font-bold">Olá, {userName || "carregando..."}</h1>
            <p className="text-cinza-claro-texto text-sm">Como está seu controle hoje?</p>
          </div>
          <button
            onClick={() => setShowMedications(true)}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            💊 Ver Meus Remédios
          </button>
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
          <div className="hidden lg:flex bg-white rounded-[32px] border border-gray-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex-col gap-5 h-full">
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
                    avatarUrl: post.users?.avatar_url || '',
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
        <GlucoseBoard 
          records={allGlucoseRecords} 
          onRecordDeleted={(id) => {
            setAllGlucoseRecords((prev) => prev.filter(r => r.id !== id));
            if (latestGlucose?.id === id) {
              setLatestGlucose(allGlucoseRecords.find(r => r.id !== id) || null);
            }
          }}
        />

      </section>

      {/* Medications Modal */}
      {showMedications && (
        <MedicationsModal onClose={() => setShowMedications(false)} />
      )}

      <Footer />
    </main>
  );
}
