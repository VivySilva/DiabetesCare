import React from "react";
import { IoMdArrowBack, IoMdNotificationsOutline } from "react-icons/io";

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
  const isHome = variant === "home";

  return (
    <header
      className={`flex items-center ${isHome ? "justify-between px-[33px]" : "justify-start gap-3 px-6"} py-4 h-[72px] backdrop-blur-[6px] sticky top-0 z-50 w-full`}
      style={{ background: "rgba(247, 249, 251, 0.8)" }}
    >
      {isHome ? (
        <>
          <h1 style={{ color: titleColor }}>{title}</h1>
          <button
            onClick={onIconClick}
            className="flex items-center justify-center text-[var(--dc-azul-escuro)]"
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
          <h1 style={{ color: titleColor }}>{title}</h1>
        </>
      )}
    </header>
  );
}
