"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import GlucoseSummary from "../components/GlucoseSummary";
import GlucoseBoard from "../components/GlucoseBoard";
import Footer from "../components/Footer";
import ArticleCard from "../components/ArticleCard";
import NotificationsScreen from "../components/NotificationsScreen";
import { getUserProfile, getGlucoseRecords, getCommunityPosts } from "../../services/api";

export default function Home() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [userName, setUserName] = useState("");
  const [latestGlucose, setLatestGlucose] = useState<any>(null);
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
        // Busca perfil (essencial)
        try {
          const profileRes = await getUserProfile(token);
          if (profileRes.user) {
            setUserName(profileRes.user.name.split(' ')[0]);
          }
        } catch (e) { 
          console.error("Erro perfil:", e);
        }

        // Busca glicemia
        try {
          const glucoseRes = await getGlucoseRecords(token);
          if (glucoseRes.records && glucoseRes.records.length > 0) {
            setLatestGlucose(glucoseRes.records[0]);
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
    <main className="min-h-screen bg-white pb-[91px]">
      <Header
        title="DiabetesCare"
        titleColor="var(--dc-azul-escuro)"
        variant="home"
        onNotificationClick={() => setShowNotifications(true)}
      />

      {showNotifications && (
        <div className="fixed inset-0 z-[60]">
          <NotificationsScreen onBack={() => setShowNotifications(false)} />
        </div>
      )}

      <section className="flex flex-col items-center px-[33px] pt-6 gap-6">
        <GlucoseSummary 
          value={latestGlucose?.glucose_value || "--"} 
          moment={latestGlucose?.period || "Sem registros"} 
          status={latestGlucose?.glucose_value > 150 ? "Atenção" : "Estável"} 
        />

        <GlucoseBoard />

        {/* Seção - Últimas publicações */}
        <div className="flex flex-col w-full" style={{ gap: "16px" }}>
          <div className="flex items-center justify-between w-full">
            <h2 className="m-0 text-texto font-bold text-lg">Últimas publicações</h2>
            <Link
              href="/patient/community"
              className="no-underline text-azul font-semibold"
              style={{ fontFamily: "var(--font-inter)", fontSize: "13px" }}
            >
              Ver Tudo
            </Link>
          </div>

          <div className="flex flex-col gap-5 w-full">
            {posts.length > 0 ? (
              posts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">Nenhuma publicação encontrada.</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
