"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { useRouter, useParams } from "next/navigation";
import {
  MdOutlineCategory,
  MdSave,
  MdDeleteOutline,
  MdAddPhotoAlternate,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdImage,
  MdLink,
} from "react-icons/md";
import { getCommunityPostById, updateCommunityPost, deleteCommunityPost } from "@/services/community/communityService";
import ImageCropperModal from "@/components/ui/ImageCropperModal";

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
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const execCmd = (cmd: string) => {
    let value: string | undefined = undefined;
    if (cmd === "createLink") {
      const url = window.prompt("Insira a URL do link:");
      if (!url) return;
      value = url;
    }
    document.execCommand(cmd, false, value);
    contentRef.current?.focus();
  };

  useEffect(() => {
    if (!isLoading && contentRef.current) {
      contentRef.current.innerHTML = content;
    }
  }, [isLoading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRawImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

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

    const htmlContent = contentRef.current?.innerHTML ?? "";
    const textOnly = contentRef.current?.textContent ?? "";
    if (textOnly.trim().length < 10) {
      alert("O conteúdo deve ter no mínimo 10 caracteres.");
      return;
    }

    setIsSaving(true);

    try {
      await updateCommunityPost(id, {
        title,
        cover_image_url: imageUrl || null,
        category,
        content_html: htmlContent,
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

      {/* Main Container: Centered, sleek card on desktop */}
      <article className="w-full max-w-[60rem] mx-auto bg-white md:mt-3 md:mb-8 md:rounded-[32px] overflow-hidden md:shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-transparent md:border-gray-100/70 p-6 md:p-10 flex flex-col gap-6">
        
        {/* Header inside Card */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-texto text-xl font-bold m-0" style={{ fontFamily: "var(--font-manrope)" }}>Editar Post</h2>
            <p className="text-cinza-claro-texto text-xs m-0">
              Atualize as informações da sua publicação.
            </p>
          </div>
          
          <button 
            type="button"
            onClick={handleDelete}
            className="p-2.5 text-vermelho hover:bg-vermelho/10 rounded-2xl transition-all active:scale-95"
            title="Excluir post"
          >
            <MdDeleteOutline size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 1. TÍTULO */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-cinza-claro-texto px-1">Título</label>
            <input
              type="text"
              placeholder="Título da publicação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-texto placeholder:text-cinza-claro-fundo focus:ring-2 focus:ring-azul outline-none transition-all shadow-sm font-bold text-lg"
              required
            />
          </div>

          {/* 2. IMAGEM DE CAPA (Uploader) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-cinza-claro-texto px-1">Imagem de Capa</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-56 rounded-3xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center gap-2 text-azul active:scale-[0.98] transition-transform shadow-sm overflow-hidden"
            >
              {imageUrl ? (
                <img
                  src={imageUrl.includes('|') ? imageUrl.split('|')[1] : imageUrl}
                  alt="Capa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-azul-claro flex items-center justify-center">
                    <MdAddPhotoAlternate size={26} className="text-azul" />
                  </div>
                  <span className="text-sm font-semibold text-azul">
                    Adicionar Imagem de Capa
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* 3. CATEGORIA */}
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
                <option value="Geral">Saúde Geral</option>
                <option value="Saúde">Saúde</option>
                <option value="Nutrição">Nutrição</option>
                <option value="Exercícios">Exercícios</option>
                <option value="Tratamento">Medicação</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cinza-claro-fundo">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* 4. CONTEÚDO (Texto com formatação) */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-cinza-claro-texto px-1">Conteúdo</label>
            
            {/* Formatting toolbar */}
            <div className="flex items-center gap-1 bg-white rounded-2xl px-3 py-2 shadow-sm w-fit border border-gray-100">
              {[
                { icon: <MdFormatBold size={19} />, cmd: "bold", label: "Negrito" },
                { icon: <MdFormatItalic size={19} />, cmd: "italic", label: "Itálico" },
                {
                  icon: <MdFormatListBulleted size={19} />,
                  cmd: "insertUnorderedList",
                  label: "Lista",
                },
                { icon: <MdImage size={19} />, cmd: "justifyCenter", label: "Centralizar" },
                {
                  icon: <MdLink size={19} />,
                  cmd: "createLink",
                  label: "Link",
                },
              ].map(({ icon, cmd, label }) => (
                <button
                  key={cmd}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd(cmd);
                  }}
                  title={label}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-cinza-fundo hover:bg-gray-100 active:scale-95 transition-all"
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Editable content area */}
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Escreva aqui o conteúdo da sua publicação..."
              className="min-h-[250px] bg-white border border-gray-100 rounded-2xl p-4 text-texto text-sm leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 focus:ring-2 focus:ring-azul transition-all shadow-sm"
              style={{ wordBreak: "break-word" }}
            />
          </div>

          {/* 5. BOTÃO DE SALVAR */}
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
      </article>

      {rawImageSrc && (
        <ImageCropperModal
          imageSrc={rawImageSrc}
          onCrop={(croppedBase64) => {
            setImageUrl(`${rawImageSrc}|${croppedBase64}`);
            setRawImageSrc(null);
          }}
          onClose={() => setRawImageSrc(null)}
        />
      )}
      <Footer />
    </div>
  );
}
