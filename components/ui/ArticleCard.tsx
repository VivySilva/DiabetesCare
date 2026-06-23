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
        <div className="w-full overflow-hidden relative" style={{ height: "192px" }}>
          {post.image ? (
            <img
              src={post.image.includes('|') ? post.image.split('|')[1] : post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)';
                  parent.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><svg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,0.6)\' stroke-width=\'1.5\'><path d=\'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\'/><polyline points=\'14 2 14 8 20 8\'/><line x1=\'16\' y1=\'13\' x2=\'8\' y2=\'13\'/><line x1=\'16\' y1=\'17\' x2=\'8\' y2=\'17\'/><polyline points=\'10 9 9 9 8 9\'/></svg></div>';
                }
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
          )}
        </div>

        {/* Container de conteúdo */}
        <div
          className="flex flex-col items-start w-full"
          style={{ padding: "24px", gap: "10.8px", display: "flex" }}
        >
          {/* Autor e Data */}
          <div className="flex items-center gap-2 w-full">
            <div className="w-7 h-7 rounded-full bg-azul-claro flex items-center justify-center shrink-0 overflow-hidden">
              {post.avatarUrl ? (
                <img
                  src={post.avatarUrl}
                  alt={post.author}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    t.style.display = 'none';
                    if (t.parentElement) {
                      t.parentElement.innerHTML = `<span class="text-azul text-[10px] font-bold" style="font-family:var(--font-inter)">${(post.author || 'A').charAt(0)}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-azul text-[10px] font-bold" style={{ fontFamily: "var(--font-inter)" }}>
                  {(post.author || 'A').charAt(0)}
                </span>
              )}
            </div>
            <div className="flex flex-col" style={{ gap: "2px" }}>
              <span className="text-[12px] font-semibold text-texto leading-none" style={{ fontFamily: "var(--font-inter)" }}>
                {post.author || 'Autor'}
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
            {(() => {
              const htmlContent = post.content?.[0];
              if (!htmlContent) return 'Clique para ler o conteúdo completo...';
              return htmlContent
                .replace(/<[^>]*>/g, " ")
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/\s+/g, " ")
                .trim() || 'Clique para ler o conteúdo completo...';
            })()}
          </p>
        </div>
      </article>
    </Link>
  );
}
