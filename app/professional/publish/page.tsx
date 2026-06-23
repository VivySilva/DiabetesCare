"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MdClose,
  MdAddPhotoAlternate,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdImage,
  MdLink,
  MdOutlineCategory,
} from "react-icons/md";
import Header from "@/components/ui/Header";
import ImageCropperModal from "@/components/ui/ImageCropperModal";

export default function PublishPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [category, setCategory] = useState("Geral");
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState("");

  /* ---------- image upload ---------- */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRawImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = ""; // Clear to allow uploading same file
  };

  /* ---------- rich-text commands ---------- */
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

  /* ---------- submit ---------- */
  const handleSubmit = async () => {
    setError("");
    const content = contentRef.current?.innerHTML ?? "";
    
    if (!title.trim() || title.length < 5) {
      setError("O título deve ter no mínimo 5 caracteres.");
      return;
    }
    
    // Simplificamos tirando as tags HTML para contar os caracteres reais
    const textOnly = contentRef.current?.textContent ?? "";
    if (textOnly.trim().length < 10) {
      setError("O conteúdo deve ter no mínimo 10 caracteres.");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para publicar.');
      return;
    }

    setIsPublishing(true);
    try {
      const { createCommunityPost } = await import('@/services/community/communityService');
      await createCommunityPost({
        title,
        cover_image_url: coverImage,
        category,
        content_html: content,
      }, token);
      router.push("/professional");
    } catch (err: any) {
      alert(err.message || 'Erro ao publicar. Tente novamente.');
      setIsPublishing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
      <Header 
        title="Criar Publicação" 
        variant="page" 
        onBackClick={() => router.push("/professional")}
      />

      {error && (
        <div className="max-w-[60rem] mx-auto mx-6 md:mx-8 mt-4 bg-red-50 text-red-500 text-sm p-3 rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Main Container: Centered, sleek card on desktop */}
      <article className="w-full max-w-[60rem] mx-auto bg-white md:mt-3 md:mb-8 md:rounded-[32px] overflow-hidden md:shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-transparent md:border-gray-100/70 p-6 md:p-10 flex flex-col gap-6">
        
        {/* 1. TÍTULO */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-cinza-claro-texto px-1">Título da Publicação</label>
          <input
            type="text"
            placeholder="Título da sua publicação..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-texto placeholder:text-cinza-claro-fundo focus:ring-2 focus:ring-azul outline-none transition-all shadow-sm font-bold text-lg"
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
            {coverImage ? (
              <img
                src={coverImage.includes('|') ? coverImage.split('|')[1] : coverImage}
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

        {/* 4. CONTEÚDO (Texto) */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-cinza-claro-texto px-1">Conteúdo da Publicação</label>
          
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
            data-placeholder="Compartilhe seu conhecimento ou dúvida com a comunidade DiabetesCare..."
            className="min-h-[250px] bg-white border border-gray-100 rounded-2xl p-4 text-texto text-sm leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 focus:ring-2 focus:ring-azul transition-all shadow-sm"
            style={{ wordBreak: "break-word" }}
          />
        </div>

        {/* 5. BOTÃO DE PUBLICAR (Dentro do fluxo do formulário) */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPublishing || !title.trim()}
          className={`w-full py-4 rounded-3xl font-bold text-white text-base shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4
            ${isPublishing || !title.trim()
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-azul shadow-blue-100"
            }`}
        >
          {isPublishing ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Publicando...
            </>
          ) : (
            "Publicar"
          )}
        </button>

      </article>

      {rawImageSrc && (
        <ImageCropperModal
          imageSrc={rawImageSrc}
          onCrop={(croppedBase64) => {
            setCoverImage(`${rawImageSrc}|${croppedBase64}`);
            setRawImageSrc(null);
          }}
          onClose={() => setRawImageSrc(null)}
        />
      )}
    </main>
  );
}