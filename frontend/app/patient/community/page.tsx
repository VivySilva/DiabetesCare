import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ArticleCard from "../../components/ArticleCard";
import { COMMUNITY_POSTS } from "./data";

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header title="DiabetesCare" titleColor="var(--dc-azul-escuro)" variant="home" />

      <section className="flex flex-col items-start px-[33px] pt-6 gap-6 w-full">
        {/* Título e Descrição */}
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-texto">Comunidade</h1>
          <p className="m-0 text-cinza-claro-texto">
            Conecte-se com profissionais e compartilhe conhecimentos sobre bem-estar.
          </p>
        </div>

        {/* Lista de Posts */}
        <div className="flex flex-col gap-5 w-full pb-4">
          {COMMUNITY_POSTS.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

