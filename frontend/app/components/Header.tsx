"use client";

import React from "react";
import { IoMdArrowBack, IoMdNotificationsOutline } from "react-icons/io";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
  /** Quantidade de notificações pendentes. Exibe badge azul no sininho se > 0 */
  notificationCount?: number;
}

export default function Header({
  title,
  titleColor = "var(--dc-texto)",
  variant = "page",
  onIconClick,
  notificationCount = 0,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = variant === "home";

  // Determina a home baseada no caminho atual
  const isProfessional = pathname.startsWith("/professional");
  const homeHref = isProfessional ? "/professional" : "/patient";
  const notificationsHref = isProfessional
    ? "/professional/notifications"
    : "/patient/notifications";

  const handleBellClick = () => {
    if (onIconClick) {
      onIconClick();
    } else {
      router.push(notificationsHref);
    }
  };

  const handleBackClick = () => {
    if (onIconClick) {
      onIconClick();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`flex items-center ${isHome ? "justify-between px-[33px]" : "justify-start gap-3 px-6"} py-4 h-[72px] backdrop-blur-[6px] sticky top-0 z-50 w-full`}
      style={{ background: "rgba(247, 249, 251, 0.8)" }}
    >
      {isHome ? (
        <>
          <Link href={homeHref} className="no-underline flex-1">
            <h1 style={{ color: titleColor }}>{title}</h1>
          </Link>
          {/* Sininho com badge azul — área de toque garantida */}
          <button
            id="btn-notifications"
            onClick={handleBellClick}
            className="relative flex items-center justify-center text-[var(--dc-cinza-fundo)] min-w-[44px] min-h-[44px]"
            aria-label="Notificações"
            type="button"
          >
            <IoMdNotificationsOutline size={26} />
            {notificationCount > 0 && (
              <span
                className="absolute top-1 right-1 flex items-center justify-center bg-azul text-white rounded-full pointer-events-none"
                style={{
                  minWidth: "16px",
                  height: "16px",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "0 3px",
                  lineHeight: 1,
                }}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>
        </>
      ) : (
        <>
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center text-[var(--dc-texto)] min-w-[44px] min-h-[44px]"
            aria-label="Voltar"
            type="button"
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
