import Link from "next/link";
import Header from "../components/Header";
import GlucoseSummary from "../components/GlucoseSummary";
import GlucoseBoard from "../components/GlucoseBoard";
import Footer from "../components/Footer";
import ArticleCard from "../components/ArticleCard";
import { COMMUNITY_POSTS } from "./community/data";

export default function Home() {
  const latestPosts = COMMUNITY_POSTS.slice(0, 2);

  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header
        title="DiabetesCare"
        titleColor="var(--dc-azul-escuro)"
        variant="home"
      />

      <section className="flex flex-col items-center px-[33px] pt-6 gap-6">
        <GlucoseSummary value={115} moment="Em jejum" status="Estável" />

        <GlucoseBoard />

        {/* Seção - Últimas publicações */}
        <div className="flex flex-col w-full" style={{ gap: "16px" }}>
          <div className="flex items-center justify-between w-full">
            <h2 className="m-0 text-texto">Últimas publicações</h2>
            <Link
              href="/patient/community"
              className="no-underline text-azul font-semibold"
              style={{ fontFamily: "var(--font-inter)", fontSize: "13px" }}
            >
              Ver Tudo
            </Link>
          </div>

          <div className="flex flex-col gap-5 w-full">
            {latestPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

