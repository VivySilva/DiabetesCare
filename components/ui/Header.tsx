"use client";

import React, { useState, useEffect } from "react";
import { IoMdArrowBack, IoMdNotificationsOutline } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSmartHomeHref } from "@/lib/hooks/useSmartHomeHref";
import LogoutModal from "@/components/ui/modals/logout-modal";
import { getNotifications } from "@/services/notifications/notificationService"
import { getUserProfile } from "@/services/user/userService";
import Avatar from "@/components/ui/profile/avatar";

interface HeaderProps {
  title: string;
  titleColor?: string;
  /**
   * - `"home"` → título à esquerda, ícone de notificação à direita, padding 33px
   * - `"page"` → ícone de voltar à esquerda, título à direita, padding 24px
   * @default "page"
   */
  variant?: "home" | "page";
  showNotification?: boolean;
  onNotificationClick?: () => void;
  onBackClick?: () => void;
  rightElement?: React.ReactNode;
}

export default function Header({
  title,
  titleColor = "var(--dc-texto)",
  variant = "page",
  showNotification = false,
  onNotificationClick,
  onBackClick,
  rightElement,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("patient");
  const logoHref = useSmartHomeHref();

  useEffect(() => {
    const fetchUnread = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await getNotifications(token);
        const notificationsList = res.data?.notifications || res.notifications || [];
        const unread = notificationsList.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Erro ao buscar notificações para o badge:", error);
      }
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage (Header):", typeof token, token?.length);
      if (!token) return;
      try {
        const res = await getUserProfile(token);
        setUserAvatar(res.user.avatar_url || null);
        setUserRole(res.user.role || "patient");
      } catch (err) {
        console.error("Erro ao carregar perfil no header (sessão inválida):", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    };

    fetchUnread();
    fetchProfile();
    // Opcional: Polling a cada 30 segundos
    const interval = setInterval(() => {
      fetchUnread();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const profileLink = userRole === "professional" ? "/professional/profile" : "/patient/profile";

  const isHome = variant === "home";

  // Determina a home baseada no caminho atual
  const isProfessional = pathname.startsWith("/professional");
  const homeHref = isProfessional ? "/professional" : "/patient";

  // Detecta qual seção está ativa para o indicador visual
  const currentSection = pathname.startsWith(homeHref + "/records") || pathname.startsWith(homeHref + "/publish")
    ? (isProfessional ? "publish" : "records")
    : pathname.startsWith(homeHref + "/community")
    ? "community"
    : pathname.startsWith(homeHref + "/profile")
    ? "profile"
    : pathname === homeHref || pathname.startsWith(homeHref + "/notifications") || pathname.startsWith(homeHref + "/home")
    ? "home"
    : null;

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const handleLogoutConfirm = () => {
    setIsLogoutOpen(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push("/");
  };

  return (
    <>
      <header
        className={`flex items-center justify-between px-6 py-4 h-[72px] backdrop-blur-[6px] sticky top-0 z-50 w-full ${isHome ? 'md:hidden' : ''}`}
        style={{
          background: "rgba(247, 249, 251, 0.8)",
          paddingLeft: isHome ? "33px" : "24px",
          paddingRight: isHome ? "33px" : "24px",
        }}
      >
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto md:px-2">
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
          <div className="overflow-hidden flex items-center gap-2">
            {/* Logo clicável no Header */}
            {isHome ? (
              <Link href={logoHref} className="flex items-center gap-2.5 no-underline group">
                <div className="w-9 h-9 bg-azul-escuro rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-active:scale-95">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="font-display font-extrabold text-lg text-azul-escuro tracking-tight group-hover:opacity-80 transition-opacity">
                  DiabetesCare
                </span>
              </Link>
            ) : (
              <>
                {/* Mini logo como home button ao lado do back */}
                <Link
                  href={logoHref}
                  className="w-8 h-8 bg-azul-escuro rounded-lg flex items-center justify-center shrink-0 hover:shadow-md transition-all active:scale-90"
                  aria-label="Ir para o início"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </Link>
                {currentSection && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse" style={{ animationDuration: "2s" }} />
                )}
                <h1 style={{ color: titleColor, fontSize: isHome ? "24px" : "20px" }} className="font-bold truncate">
                  {title}
                </h1>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {rightElement ? (
            rightElement
          ) : (
            <>
              {(isHome || showNotification) && (
                <button
                  onClick={onNotificationClick || (() => router.push(isProfessional ? '/professional/notifications' : '/patient/notifications'))}
                  className="relative flex items-center justify-center text-[var(--dc-cinza-fundo)] hover:opacity-70 transition-opacity"
                  aria-label="Notificações"
                >
                  <IoMdNotificationsOutline size={26} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}
            </>
          )}

        </div>
        </div>
        {/* Barra indicadora de seção */}
        {currentSection && !isHome && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/60 via-blue-500 to-blue-400/60">
            <div className="h-full w-1/3 bg-white/30 rounded-full mx-auto" />
          </div>
        )}
      </header>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />


    </>
  );
}
