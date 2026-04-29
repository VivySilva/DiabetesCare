"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdHomeFilled,
  MdOutlineEditNote,
  MdGroups,
  MdPersonOutline,
  MdPerson,
} from "react-icons/md";

export default function Footer() {
  const pathname = usePathname();

  // Verifica se a URL atual começa com /professional. Se não, assume que é /patient.
  const isProfessional = pathname.startsWith("/professional");
  const basePath = isProfessional ? "/professional" : "/patient";

  // Os links agora são gerados dinamicamente com base no tipo de usuário
  const NAV_ITEMS = [
    { label: "Início", href: basePath, icon: MdHomeFilled, size: 26 },
    {
      label: isProfessional ? "Publicar" : "Registros",
      href: isProfessional ? `${basePath}/publish` : `${basePath}/records`,
      icon: MdOutlineEditNote,
      size: 28,
    },
    {
      label: "Comunidade",
      href: `${basePath}/community`,
      icon: MdGroups,
      size: 28,
    },
    {
      label: "Perfil",
      href: `${basePath}/profile`,
      icon: MdPerson,
      size: 26,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex flex-row items-center justify-between h-[91px] px-[33px] pt-3 pb-6 rounded-t-[24px] z-50 max-w-md mx-auto"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        boxShadow: "0px -4px 24px rgba(25, 28, 30, 0.15)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon, size }) => {
        const active = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0 no-underline"
          >
            <div
              className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-200 ${
                active ? "bg-azul-claro" : "bg-transparent"
              }`}
            >
              <Icon
                size={size}
                color={active ? "var(--dc-azul)" : "var(--dc-cinza-fundo)"}
              />
            </div>

            <span
              className="detail"
              style={{
                color: active ? "var(--dc-azul)" : "var(--dc-cinza-fundo)",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
