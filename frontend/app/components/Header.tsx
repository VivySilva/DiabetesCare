"use client";

import React from "react";
import { IoMdArrowBack, IoMdNotificationsOutline } from "react-icons/io";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  title: string;
  titleColor?: string;
  /**
   * - `"home"` → título à esquerda, ícone de notificação à direita, padding 33px
   * - `"page"` → ícone de voltar à esquerda, título à direita, padding 24px
   * @default "page"
   */
  variant?: "home" | "page";
  onIconClick?: () => void;
}

export default function Header({
  title,
  titleColor = "var(--dc-texto)",
  variant = "page",
  onIconClick,
}: HeaderProps) {
  const pathname = usePathname();
  const isHome = variant === "home";

  // Determina a home baseada no caminho atual
  const isProfessional = pathname.startsWith("/professional");
  const homeHref = isProfessional ? "/professional" : "/patient";

  return (
    <header
      className={`flex items-center ${isHome ? "justify-between px-[33px]" : "justify-start gap-3 px-6"} py-4 h-[72px] backdrop-blur-[6px] sticky top-0 z-50 w-full`}
      style={{ background: "rgba(247, 249, 251, 0.8)" }}
    >
      {isHome ? (
        <>
          <Link href={homeHref} className="no-underline">
            <h1 style={{ color: titleColor }}>{title}</h1>
          </Link>
          <button
            onClick={onIconClick}
            className="flex items-center justify-center text-[var(--dc-cinza-fundo)]"
            aria-label="Notificações"
          >
            <IoMdNotificationsOutline size={26} />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onIconClick}
            className="flex items-center justify-center text-[var(--dc-texto)]"
            aria-label="Voltar"
          >
            <IoMdArrowBack size={24} />
          </button>
          <Link href={homeHref} className="no-underline">
            <h1 style={{ color: titleColor }}>{title}</h1>
          </Link>
        </>
      )}
    </header>
  );
}
