"use client";

import React, { useState } from "react";
import { IoMdArrowBack, IoMdNotificationsOutline } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LogoutModal from "./modals/logout-modal";

interface HeaderProps {
  title: string;
  titleColor?: string;
  /**
   * - `"home"` → título à esquerda, ícone de notificação à direita, padding 33px
   * - `"page"` → ícone de voltar à esquerda, título à direita, padding 24px
   * @default "page"
   */
  variant?: "home" | "page";
  onNotificationClick?: () => void;
  onBackClick?: () => void;
  rightElement?: React.ReactNode;
}

export default function Header({
  title,
  titleColor = "var(--dc-texto)",
  variant = "page",
  onNotificationClick,
  onBackClick,
  rightElement,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const isHome = variant === "home";

  // Determina a home baseada no caminho atual
  const isProfessional = pathname.startsWith("/professional");
  const homeHref = isProfessional ? "/professional" : "/patient";

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const handleLogoutConfirm = () => {
    setIsLogoutOpen(false);
    router.push("/login");
  };

  return (
    <>
      <header
        className={`flex items-center justify-between px-6 py-4 h-[72px] backdrop-blur-[6px] sticky top-0 z-50 w-full`}
        style={{
          background: "rgba(247, 249, 251, 0.8)",
          paddingLeft: isHome ? "33px" : "24px",
          paddingRight: isHome ? "33px" : "24px",
        }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {!isHome && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center text-[var(--dc-texto)] hover:opacity-70 transition-opacity shrink-0"
              aria-label="Voltar"
            >
              <IoMdArrowBack size={24} />
            </button>
          )}
          <Link href={homeHref} className="no-underline overflow-hidden">
            <h1 style={{ color: titleColor, fontSize: isHome ? "24px" : "20px" }} className="font-bold truncate">
              {title}
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {rightElement ? (
            rightElement
          ) : (
            <>
              {isHome && (
                <button
                  onClick={onNotificationClick}
                  className="flex items-center justify-center text-[var(--dc-cinza-fundo)] hover:opacity-70 transition-opacity"
                  aria-label="Notificações"
                >
                  <IoMdNotificationsOutline size={26} />
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="flex items-center justify-center text-red-500 hover:opacity-70 transition-opacity"
            aria-label="Sair"
          >
            <MdLogout size={24} />
          </button>
        </div>
      </header>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
