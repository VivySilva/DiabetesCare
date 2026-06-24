"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/ui/Footer";
import ArticleCard from "@/components/ui/ArticleCard";
import { getCommunityPosts } from "@/services/community/communityService";

export default function Home() {
  const router = useRouter();
  const [publicPosts, setPublicPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirecionamento inteligente baseado no Role caso já exista sessão ativa
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token) {
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'PROFESSIONAL') {
            router.push('/professional');
            return;
          }
        } catch (e) {
          console.error("Erro ao ler dados da sessão:", e);
        }
      }
      router.push("/patient/home"); 
    }
  }, [router]);

  // Busca os artigos públicos
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const postsRes = await getCommunityPosts();
        setPublicPosts(postsRes.posts?.slice(0, 3) || []);
      } catch (e) {
        console.error("Erro ao buscar artigos públicos:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  return (
    <main className="min-h-screen bg-[#F8F9FA] flex flex-col text-texto selection:bg-blue-100">
      
      {/* ── HEADER PÚBLICO COM LOGO ── */}
      {/* O header agora tem fundo transparente no topo para o gradiente brilhar através dele */}
      <header className="absolute top-0 z-50 w-full">
        <div className="w-full max-w-5xl mx-auto px-6 md:px-8 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-azul-escuro rounded-xl flex items-center justify-center shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-extrabold text-xl text-azul-escuro tracking-tight">
              DiabetesCare
            </span>
          </Link>
          
          <div className="flex gap-3 items-center">
            <Link 
              href="/login"
              className="text-azul font-bold px-4 py-2 text-sm rounded-full hover:bg-blue-100/50 transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/register"
              className="bg-blue-600 text-white px-6 py-2.5 text-sm rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION COM GRADIENTE ── */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 flex flex-col items-center justify-center overflow-hidden">
        {/* Fundo Gradiente Azul -> Branco/Cinza */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-50/50 to-[#F8F9FA] -z-20" />
        {/* Ponto de luz extra no centro para dar destaque ao título */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-300/30 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-5xl mx-auto px-6 md:px-8 flex flex-col items-center text-center gap-8 relative z-10">
          
          {/* Badge Chamativa */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 shadow-sm text-blue-600 text-xs font-extrabold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Sua saúde em equilíbrio
          </div>
          
          {/* Título com Destaque */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-azul-escuro leading-[1.15] md:leading-[1.1] tracking-tight max-w-4xl mx-auto">
            O controle inteligente da sua saúde <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">
              na palma da sua mão.
            </span>
          </h1>
          
          {/* Subtítulo */}
          <p className="text-cinza-claro-texto text-lg md:text-xl max-w-2xl leading-relaxed mx-auto">
            Monitore seus níveis glicêmicos de forma simples, acompanhe prescrições médicas e interaja com uma comunidade ativa de cuidados e bem-estar.
          </p>
          
          {/* Botões de Ação Centralizados */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link 
              href="/login"
              className="w-full sm:w-auto bg-blue-600 text-white text-center px-10 py-4 rounded-full text-lg font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Começar Agora
            </Link>
            <Link 
              href="#features"
              className="w-full sm:w-auto bg-white border border-gray-200 text-center text-texto px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              Conhecer Recursos
            </Link>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO DE RECURSOS / DIFERENCIAIS ── */}
      <section id="features" className="w-full bg-white border-y border-gray-100 py-16 md:py-24">
        <div className="w-full max-w-5xl mx-auto px-6 md:px-8 flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-azul-escuro">Tudo o que você precisa em um só lugar</h2>
            <p className="text-cinza-claro-texto text-lg">Descubra as ferramentas projetadas especialmente para facilitar o seu monitoramento diário.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F8F9FA] rounded-[32px] p-8 border border-gray-100 flex flex-col gap-4 group hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
              <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl shadow-sm flex items-center justify-center font-bold text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                📊
              </div>
              <h3 className="text-xl font-bold text-azul-escuro">Painel Clínico</h3>
              <p className="text-cinza-claro-texto text-sm leading-relaxed">
                Histórico detalhado e gráficos intuitivos sobre suas taxas de glicemia para que você e seu médico tomem decisões seguras.
              </p>
            </div>

            <div className="bg-[#F8F9FA] rounded-[32px] p-8 border border-gray-100 flex flex-col gap-4 group hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
              <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl shadow-sm flex items-center justify-center font-bold text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                💊
              </div>
              <h3 className="text-xl font-bold text-azul-escuro">Gestão de Remédios</h3>
              <p className="text-cinza-claro-texto text-sm leading-relaxed">
                Nunca mais esqueça uma dose. Organize seus horários de medicamentos e insulinas com notificações eficientes.
              </p>
            </div>

            <div className="bg-[#F8F9FA] rounded-[32px] p-8 border border-gray-100 flex flex-col gap-4 group hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
              <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl shadow-sm flex items-center justify-center font-bold text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                🤖
              </div>
              <h3 className="text-xl font-bold text-azul-escuro">Assistente IA</h3>
              <p className="text-cinza-claro-texto text-sm leading-relaxed">
                Acesse a Diabetica, nossa inteligência artificial focada em tirar dúvidas rápidas sobre alimentação, saúde e rotinas de autocuidado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO DE ARTIGOS PÚBLICOS ── */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-azul-escuro">Conteúdo Informativo</h2>
            <p className="text-cinza-claro-texto text-lg">Aprenda mais sobre hábitos saudáveis com nossa comunidade.</p>
          </div>
          <Link
            href="/articles"
            className="text-azul font-bold text-sm bg-blue-50 px-5 py-2.5 rounded-full hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            Ver todos
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicPosts.length > 0 ? (
              publicPosts.map((post) => (
                <ArticleCard key={post.id} href={`/articles/${post.id}`} post={{
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
              <p className="text-gray-400 col-span-full text-center py-6">
                Nenhum artigo disponível no momento.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── SEÇÃO FINAL CALL TO ACTION (CTA) ── */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-8 pb-16 md:pb-24">
        <div className="w-full bg-azul-escuro rounded-[40px] p-10 md:p-16 text-center text-white flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-transparent pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-extrabold max-w-2xl relative z-10 leading-tight">
            Pronto para transformar sua rotina de saúde?
          </h2>
          <p className="text-blue-100 max-w-xl text-lg opacity-90 relative z-10">
            Crie sua conta gratuitamente em menos de dois minutos e tenha total clareza e previsibilidade sobre o seu controle glicêmico.
          </p>
          <Link 
            href="/register"
            className="mt-2 bg-white text-azul-escuro px-10 py-5 rounded-full font-extrabold text-lg hover:bg-gray-50 transition-transform hover:scale-[1.02] active:scale-[0.98] relative z-10 shadow-lg"
          >
            Cadastrar-se Grátis
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}