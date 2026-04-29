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

export default function PublishPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [category, setCategory] = useState("Saúde");
  const [isPublishing, setIsPublishing] = useState(false);

  /* ---------- image upload ---------- */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
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
  const handleSubmit = () => {
    const content = contentRef.current?.innerHTML ?? "";
    if (!title.trim() || !content.trim()) return;
    setIsPublishing(true);
    setTimeout(() => router.push("/professional"), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col">
      {/* ── TOP BAR ── */}
      <header className="flex items-center justify-between px-5 py-4 bg-[#F7F9FB] sticky top-0 z-50">
        <button
          onClick={() => router.push("/professional")}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-[var(--dc-texto)] active:scale-95 transition-transform"
          aria-label="Fechar"
        >
          <MdClose size={20} />
        </button>

        <h1 className="text-[var(--dc-texto)] font-bold text-base">
          Criar Publicação
        </h1>

        {/* Categoria pill */}
        <div className="relative">
          <MdOutlineCategory
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--dc-azul)] pointer-events-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none bg-[var(--dc-azul-claro)] text-[var(--dc-azul)] text-xs font-semibold pl-7 pr-3 py-1.5 rounded-full outline-none cursor-pointer"
          >
            <option value="Saúde">Saúde</option>
            <option value="Nutrição">Nutrição</option>
            <option value="Exercícios">Exercícios</option>
            <option value="Dicas">Dicas</option>
          </select>
        </div>
      </header>

      {/* ── SCROLLABLE CONTENT ── */}
      <main className="flex-1 overflow-y-auto px-5 pb-32 flex flex-col gap-5">

        {/* Cover image */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-44 rounded-3xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center gap-2 text-[var(--dc-azul)] active:scale-[0.98] transition-transform shadow-sm overflow-hidden"
        >
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt="Capa"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[var(--dc-azul-claro)] flex items-center justify-center">
                <MdAddPhotoAlternate size={26} className="text-[var(--dc-azul)]" />
              </div>
              <span className="text-sm font-semibold text-[var(--dc-azul)]">
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

        {/* Title */}
        <textarea
          placeholder="Título da sua publicação..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={2}
          className="w-full bg-transparent resize-none text-[var(--dc-texto)] text-2xl font-bold placeholder:text-gray-300 outline-none leading-snug"
        />

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Formatting toolbar */}
        <div className="flex items-center gap-1 bg-white rounded-2xl px-3 py-2 shadow-sm w-fit">
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
              className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--dc-cinza-fundo)] hover:bg-gray-100 active:scale-95 transition-all"
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
          className="min-h-[200px] text-[var(--dc-texto)] text-sm leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
          style={{ wordBreak: "break-word" }}
        />
      </main>

      {/* ── STICKY PUBLISH BUTTON ── */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#F7F9FB] to-transparent max-w-md mx-auto">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPublishing || !title.trim()}
          className={`w-full py-4 rounded-3xl font-bold text-white text-base shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]
            ${isPublishing || !title.trim()
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-[var(--dc-azul)]"
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
      </div>
    </div>
  );
}