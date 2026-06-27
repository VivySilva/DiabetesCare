"use client";

import Link from "next/link";
import { MdEdit } from "react-icons/md";
import { Post } from "@/app/patient/community/data";
import { usePathname, useRouter } from "next/navigation";

interface ArticleCardProps {
  post: Post;
  isProfessional?: boolean;
  onEdit?: (id: string) => void;
  /**
   * Se fornecido, usa este href em vez do padrão (basePath/community/id).
   * Útil para páginas públicas (ex: /articles/id).
   */
  href?: string;
  onDelete?: (id: string) => void;
}

export default function ArticleCard({ post, isProfessional, onEdit, onDelete, href }: ArticleCardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = pathname.startsWith("/professional") ? "/professional" : "/patient";
  const linkHref = href || `${basePath}/community/${post.id}`;

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(post.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(post.id);
  };

  return (
    <Link href={linkHref} className="no-underline w-full relative block group">
      <article
        className="flex flex-col items-start w-full rounded-[32px] overflow-hidden bg-white cursor-pointer
                   shadow-[0_4px_4px_rgba(0,0,0,0.05)]
                   transition-all duration-500 ease-out
                   group-hover:-translate-y-1 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)]
                   active:scale-[0.98] active:transition-transform active:duration-150"
      >
        {/* Botões de Ação (Apenas para Profissional) */}
        {isProfessional && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl text-azul shadow-lg hover:bg-azul hover:text-white hover:scale-110 transition-all duration-300 ease-out active:scale-90 opacity-0 group-hover:opacity-100"
                aria-label="Editar publicação"
              >
                <MdEdit size={20} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl text-red-500 shadow-lg hover:bg-red-500 hover:text-white hover:scale-110 transition-all duration-300 ease-out active:scale-90 opacity-0 group-hover:opacity-100"
                aria-label="Excluir publicação"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            )}
          </div>
        )}

        {/* Imagem do artigo */}
        <div className="w-full overflow-hidden relative" style={{ height: "192px" }}>
          {/* Overlay gradiente que aparece no hover */}
          <div
            className="absolute inset-0 z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)",
            }}
          />

          {post.image ? (
            <img
              src={post.image.includes('|') ? post.image.split('|')[1] : post.image}
              alt={post.title}
              className="w-full h-full object-cover
                         group-hover:scale-110 group-hover:rotate-[1.5deg]
                         transition-all duration-700 ease-out"
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
              className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-110"
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
          className="flex flex-col items-start w-full transition-colors duration-500 ease-out group-hover:bg-blue-50/30"
          style={{ padding: "24px", gap: "10.8px", display: "flex" }}
        >
          {/* Autor e Data */}
          <div className="flex items-center gap-2 w-full">
            <div
              onClick={(e) => {
                if (post.authorId && post.authorRole === 'PROFESSIONAL') {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/profissionais/${post.authorId}`);
                }
              }}
              className={`w-7 h-7 rounded-full bg-azul-claro flex items-center justify-center shrink-0 overflow-hidden
                          transition-transform duration-300 ease-out group-hover:scale-110 ${
                            post.authorId && post.authorRole === 'PROFESSIONAL' ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''
                          }`}
            >
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
              {post.authorId && post.authorRole === 'PROFESSIONAL' ? (
                <Link
                  href={`/profissionais/${post.authorId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[12px] font-semibold text-texto leading-none transition-colors duration-300 hover:text-azul hover:underline w-fit"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {post.author || 'Autor'}
                </Link>
              ) : (
                <span className="text-[12px] font-semibold text-texto leading-none transition-colors duration-300 group-hover:text-azul" style={{ fontFamily: "var(--font-inter)" }}>
                  {post.author || 'Autor'}
                </span>
              )}
              <span className="text-[10px] text-cinza-claro-texto uppercase tracking-widest font-medium" style={{ fontFamily: "var(--font-inter)" }}>
                {post.date}
              </span>
            </div>
          </div>

          {/* Título com underline animado */}
          <h3
            className="m-0 text-texto leading-snug relative inline-block transition-colors duration-300 group-hover:text-azul-escuro"
            style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "16px" }}
          >
            {post.title}
            <span
              className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-blue-400
                         transition-all duration-500 ease-out group-hover:w-full"
              style={{ borderRadius: "1px" }}
            />
          </h3>

          {/* Trecho */}
          <p
            className="m-0 text-cinza-claro-texto line-clamp-2 transition-colors duration-300"
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
