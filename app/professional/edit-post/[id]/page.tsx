"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { useRouter, useParams } from "next/navigation";
import { MdOutlineImage, MdOutlineCategory, MdSave, MdDeleteOutline } from "react-icons/md";
import { getCommunityPostById, updateCommunityPost, deleteCommunityPost } from "@/services/community/communityService";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Saúde");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await getCommunityPostById(id);
        const post = res.post || res.data || res;
        setTitle(post?.title || "");
        setContent(post?.content_html || "");
        setCategory(post?.category || "Saúde");
        setImageUrl(post?.cover_image_url || "");
      } catch (err) {
        console.error("Erro ao carregar post:", err);
        alert("Não foi possível carregar a publicação.");
        router.push("/professional/my-posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsSaving(true);

    try {
      await updateCommunityPost(id, {
        title,
        cover_image_url: imageUrl || null,
        category,
        content_html: content,
      }, token);

      router.push("/professional/my-posts");
    } catch (err: any) {
      alert(err.message || "Erro ao salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm("Tem certeza que deseja excluir esta publicação?")) return;

    try {
      await deleteCommunityPost(id, token);
      router.push("/professional/my-posts");
    } catch (err: any) {
      alert(err.message || "Erro ao excluir publicação.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-[100px]">
        <Header title="Editar Publicação" variant="page" />
        <main className="flex items-center justify-center flex-1">
          <div className="w-10 h-10 border-4 border-azul border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-[100px]">
      <Header 
        title="Editar Publicação" 
        variant="page" 
      />

      <main className="flex flex-col px-6 pt-4 gap-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h2 className="text-texto text-xl font-bold">Editar Post</h2>
            <p className="text-cinza-claro-texto text-sm">
              Atualize as informações da sua publicação.
            </p>
          </div>
          
          <button 
            onClick={handleDelete}
            className="p-3 text-vermelho hover:bg-vermelho-fundo rounded-2xl transition-colors"
            title="Excluir post"
          >
            <MdDeleteOutline size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Título */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-cinza-claro-texto px-1">Título</label>
            <input
              type="text"
              placeholder="Título da publicação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-texto placeholder:text-cinza-claro-fundo focus:ring-2 focus:ring-azul outline-none transition-all shadow-sm"
              required
            />
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-cinza-claro-texto px-1">Categoria</label>
            <div className="relative text-texto">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cinza-claro-fundo pointer-events-none">
                <MdOutlineCategory size={20} />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 text-texto appearance-none focus:ring-2 focus:ring-azul outline-none transition-all shadow-sm cursor-pointer"
              >
                <option value="Saúde">Saúde</option>
                <option value="Nutrição">Nutrição</option>
                <option value="Exercícios">Exercícios</option>
                <option value="Dicas">Dicas</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cinza-claro-fundo">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Imagem (URL) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-cinza-claro-texto px-1">URL da Imagem</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cinza-claro-fundo">
                <MdOutlineImage size={20} />
              </div>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 text-texto placeholder:text-cinza-claro-fundo focus:ring-2 focus:ring-azul outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-cinza-claro-texto px-1">Conteúdo</label>
            <textarea
              placeholder="Escreva aqui o conteúdo..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl p-4 min-h-[200px] text-texto placeholder:text-cinza-claro-fundo focus:ring-2 focus:ring-azul outline-none transition-all shadow-sm resize-none"
              required
            />
          </div>

          {/* Botão Salvar */}
          <button
            type="submit"
            disabled={isSaving}
            className={`w-full bg-azul hover:bg-azul-escuro text-white font-bold py-4 rounded-3xl shadow-lg shadow-azul-claro flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] mt-4 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
            ) : (
              <>
                Salvar Alterações
                <MdSave size={20} />
              </>
            )}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
