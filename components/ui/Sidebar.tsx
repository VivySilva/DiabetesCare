"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MdHomeFilled,
  MdOutlineEditNote,
  MdGroups,
  MdPerson,
  MdLogout,
} from "react-icons/md";
import LogoutModal from "@/components/ui/modals/logout-modal";
import { getUserProfile } from "@/services/user/userService";
import Avatar from "@/components/ui/profile/avatar";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("patient");

  // Skip rendering sidebar on login, register, and password recovery pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password");

  useEffect(() => {
    if (isAuthPage) return;

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await getUserProfile(token);
        setUserAvatar(res.user.avatar_url || null);
        setUserName(res.user.name || "");
        setUserRole(res.user.role || "patient");
      } catch (err) {
        console.error("Erro ao carregar dados no sidebar:", err);
      }
    };

    fetchProfile();
  }, [isAuthPage]);

  if (isAuthPage) return null;

  const isProfessional = pathname.startsWith("/professional");
  const basePath = isProfessional ? "/professional" : "/patient";

  const NAV_ITEMS = [
    { label: "Início", href: basePath, icon: MdHomeFilled, size: 24 },
    {
      label: isProfessional ? "Publicar" : "Registros",
      href: isProfessional ? `${basePath}/publish` : `${basePath}/records`,
      icon: MdOutlineEditNote,
      size: 26,
    },
    {
      label: "Comunidade",
      href: `${basePath}/community`,
      icon: MdGroups,
      size: 26,
    },
    {
      label: "Perfil",
      href: `${basePath}/profile`,
      icon: MdPerson,
      size: 24,
    },
  ];

  const handleLogoutConfirm = () => {
    setIsLogoutOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <>
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-gray-100 h-screen fixed top-0 left-0 z-40 p-6 justify-between select-none shadow-[4px_0_24px_rgba(25,28,30,0.03)]">
        <div className="flex flex-col gap-10">
          {/* Logo / Brand */}
          <Link href={basePath} className="flex items-center gap-3 no-underline pl-2">
            <div className="w-10 h-10 bg-azul rounded-xl flex items-center justify-center shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 12H17" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-extrabold text-lg text-azul-escuro tracking-tight">DiabetesCare</span>
          </Link>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map(({ label, href, icon: Icon, size }) => {
              const active = pathname === href || (href !== basePath && pathname.startsWith(href));

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-[16px] no-underline transition-all duration-200 group ${
                    active
                      ? "bg-azul text-white shadow-lg shadow-azul/10 font-bold"
                      : "text-cinza-claro-texto hover:bg-azul-fundo hover:text-texto font-semibold"
                  }`}
                >
                  <Icon
                    size={size}
                    className={`transition-colors duration-200 ${
                      active ? "text-white" : "text-cinza-claro-fundo group-hover:text-azul"
                    }`}
                  />
                  <span className="text-sm">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="flex flex-col gap-4 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-3 pl-2">
            <Avatar src={userAvatar || undefined} size={40} mode="view" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm text-texto truncate">{userName || "Carregando..."}</span>
              <span className="text-[10px] font-bold text-cinza-claro-texto uppercase tracking-wider">
                {userRole?.toLowerCase() === "professional" ? "Profissional" : "Paciente"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsLogoutOpen(true)}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-[16px] text-red-600 font-bold hover:bg-red-50/50 transition-colors"
          >
            <MdLogout size={22} className="text-red-500" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
