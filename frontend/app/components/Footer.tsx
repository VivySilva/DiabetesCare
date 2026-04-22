"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdHomeFilled, MdOutlineEditNote, MdGroups } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";


const NAV_ITEMS = [
  { label: "Início",      href: "/patient",            icon: MdHomeFilled,      size: 26 },
  { label: "Registros",   href: "/patient/records",    icon: MdOutlineEditNote, size: 28 },
  { label: "Comunidade",  href: "/patient/community",  icon: MdGroups,          size: 28 },
  { label: "Perfil",      href: "/patient/profile",    icon: FaRegUser,         size: 20 },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex flex-row items-center justify-between h-[91px] px-[33px] pt-3 pb-6 rounded-t-[24px] z-50"
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
              style={{ color: active ? "var(--dc-azul)" : "var(--dc-cinza-fundo)" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
