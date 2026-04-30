"use client";

import Link from "next/link";
import { MdEdit } from "react-icons/md";
import { Post } from "@/app/patient/community/data";
import { usePathname } from "next/navigation";

interface ArticleCardProps {
  post: Post;
  isProfessional?: boolean;
  onEdit?: (id: string) => void;
}

export default function ArticleCard({ post, isProfessional, onEdit }: ArticleCardProps) {
  const pathname = usePathname();
  const basePath = pathname.startsWith("/professional") ? "/professional" : "/patient";

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(post.id);
  };

  return (
    <Link href={`${basePath}/community/${post.id}`} className="no-underline w-full relative">
      <article
        className="flex flex-col items-start w-full rounded-[32px] overflow-hidden bg-white transition-transform active:scale-[0.98] cursor-pointer group"
        style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)" }}
      >
        {/* Botão de Editar (Apenas para Profissional se onEdit for fornecido) */}
        {isProfessional && onEdit && (
          <button
            onClick={handleEditClick}
            className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-2xl text-azul shadow-lg hover:bg-azul hover:text-white transition-all transform active:scale-90"
            aria-label="Editar publicação"
          >
            <MdEdit size={20} />
          </button>
        )}

        {/* Imagem do artigo */}
        <div className="w-full overflow-hidden" style={{ height: "192px" }}>
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Container de conteúdo */}
        <div
          className="flex flex-col items-start w-full"
          style={{ padding: "24px", gap: "10.8px", display: "flex" }}
        >
          {/* Autor e Data */}
          <div className="flex items-center gap-2 w-full">
            <div className="w-7 h-7 rounded-full bg-azul-claro flex items-center justify-center shrink-0">
              <span className="text-azul text-[10px] font-bold" style={{ fontFamily: "var(--font-inter)" }}>
                {post.author.charAt(0)}
              </span>
            </div>
            <div className="flex flex-col" style={{ gap: "2px" }}>
              <span className="text-[12px] font-semibold text-texto leading-none" style={{ fontFamily: "var(--font-inter)" }}>
                {post.author}
              </span>
              <span className="text-[10px] text-cinza-claro-texto uppercase tracking-widest font-medium" style={{ fontFamily: "var(--font-inter)" }}>
                {post.date}
              </span>
            </div>
          </div>

          {/* Título */}
          <h3
            className="m-0 text-texto leading-snug"
            style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "16px" }}
          >
            {post.title}
          </h3>

          {/* Trecho */}
          <p
            className="m-0 text-cinza-claro-texto line-clamp-2"
            style={{ fontFamily: "var(--font-inter)", fontSize: "13px", lineHeight: "1.6" }}
          >
            {post.content[0]}
          </p>
        </div>
      </article>
    </Link>
  );
}
