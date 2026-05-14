"use client";

import React, { useState, useEffect } from "react";
import { IoMdArrowBack, IoMdNotificationsOutline } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LogoutModal from "@/components/ui/modals/logout-modal";
import { getNotifications } from "@/services/notifications/notificationService"
import { getUserProfile } from "@/services/user/userService";
import NotificationsScreen from "@/components/features/notifications/NotificationsScreen";
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("patient");

  useEffect(() => {
    const fetchUnread = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await getNotifications(token);
        const notificationsList = res.notifications || [];
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
    router.push("/login");
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
              {(isHome || showNotification) && (
                <button
                  onClick={onNotificationClick || (() => setIsNotificationsOpen(true))}
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

          {/* Mini User Icon — hidden on desktop (Sidebar handles it) */}
          <Link 
            href={profileLink}
            className="flex items-center justify-center active:scale-95 transition-all md:hidden"
          >
            <Avatar src={userAvatar || undefined} size={34} mode="view" />
          </Link>
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="flex items-center justify-center text-red-500 hover:opacity-70 transition-opacity md:hidden"
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

      {isNotificationsOpen && (
        <NotificationsScreen onBack={() => setIsNotificationsOpen(false)} />
      )}
    </>
  );
}
