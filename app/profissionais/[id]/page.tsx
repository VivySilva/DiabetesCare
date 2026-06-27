"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import {
  MdCardMembership,
  MdSchool,
  MdOutlineEmail,
  MdOutlinePhone,
  MdOutlineLocationOn,
  MdAssignmentInd,
  MdBusiness,
  MdPerson,
  MdCalendarToday,
  MdShare,
  MdContentCopy,
  MdCheck,
} from "react-icons/md";
import { getPublicProfile } from "@/services/user/profileService";
import { useSmartHomeHref } from "@/lib/hooks/useSmartHomeHref";

export default function PublicProfessionalProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const logoHref = useSmartHomeHref();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getPublicProfile(id);
        if (res.profile) {
          setProfile(res.profile);
        } else {
          setError("Perfil não encontrado.");
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar perfil.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
        <PublicHeader logoHref={logoHref} />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="flex flex-col items-center gap-6 py-24">
            <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-6 w-48 bg-gray-100 animate-pulse rounded-lg" />
            <div className="h-4 w-32 bg-gray-100 animate-pulse rounded-full" />
            <div className="w-full max-w-lg space-y-4 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
        <PublicHeader logoHref={logoHref} />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="flex flex-col items-center gap-6 py-24 max-w-md text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <MdPerson size={40} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-azul-escuro">
              Perfil não encontrado
            </h1>
            <p className="text-cinza-claro-texto leading-relaxed">
              O profissional que você procura não foi encontrado ou o perfil não está disponível publicamente.
            </p>
            <Link
              href="/"
              className="mt-2 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <IoMdArrowBack size={18} />
              Voltar para o início
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col selection:bg-blue-100">
      <PublicHeader logoHref={logoHref} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-5 sm:px-8 py-6 md:py-10">
        {/* Navegação de Voltar */}
        <nav className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-cinza-claro-texto hover:text-azul transition-colors text-sm font-medium group"
          >
            <IoMdArrowBack size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar para o início
          </Link>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Coluna 1 — Card do Profissional */}
          <div className="md:col-span-1 bg-white rounded-[32px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center gap-4 relative md:sticky md:top-24">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `<span class="text-blue-600 font-extrabold text-3xl">${(profile.name || "P").charAt(0)}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-blue-600 font-extrabold text-3xl">
                  {(profile.name || "P").charAt(0)}
                </span>
              )}
            </div>

            {/* Nome */}
            <div className="text-center">
              <h1 className="text-xl font-extrabold text-gray-900">
                {profile.name}
              </h1>
              {profile.specialty && (
                <span className="inline-block bg-blue-50 text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full mt-2 tracking-wide uppercase">
                  {profile.specialty}
                </span>
              )}
              {profile.license_number && (
                <div className="mt-2 bg-gray-50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Registro Profissional
                  </p>
                  <p className="text-blue-600 font-bold text-sm mt-0.5">
                    {profile.license_number}
                  </p>
                </div>
              )}
            </div>

            <div className="w-full h-px bg-gray-100" />

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                {profile.bio}
              </p>
            )}

            {/* Membro desde */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MdCalendarToday size={14} />
              <span>Membro desde {memberSince}</span>
            </div>

            {/* Compartilhar */}
            <ShareButtons
              name={profile.name}
              specialty={profile.specialty}
            />

            {/* CTA */}
            <Link
              href="/register"
              className="w-full bg-blue-600 text-white text-center py-3.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
            >
              Criar Conta Grátis
            </Link>
          </div>

          {/* Coluna 2 — Informações Detalhadas */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {/* Seção: Identificação Profissional */}
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                <MdAssignmentInd size={16} className="text-blue-500" />
                Identificação Profissional
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoBlock
                  icon={<MdAssignmentInd size={20} />}
                  label="Especialidade"
                  value={profile.specialty || "Não informada"}
                />
                <InfoBlock
                  icon={<MdCardMembership size={20} />}
                  label="Registro (CRM/CRN)"
                  value={profile.license_number || "Não informado"}
                  highlight
                />
                <div className="sm:col-span-2">
                  <InfoBlock
                    icon={<MdSchool size={20} />}
                    label="Formação / Titulação"
                    value={profile.education || "Não informada"}
                  />
                </div>
              </div>
            </div>

            {/* Seção: Contato Profissional */}
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                <MdOutlineEmail size={16} className="text-blue-500" />
                Contato Profissional
              </h3>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoBlock
                    icon={<MdOutlineEmail size={20} />}
                    label="E-mail Profissional"
                    value={profile.professional_email || "Não informado"}
                  />
                  <InfoBlock
                    icon={<MdOutlinePhone size={20} />}
                    label="Telefone / WhatsApp"
                    value={profile.professional_phone || "Não informado"}
                  />
                </div>

                {profile.clinic_name && (
                  <InfoBlock
                    icon={<MdBusiness size={20} />}
                    label="Clínica / Consultório"
                    value={profile.clinic_name}
                  />
                )}

                {profile.clinic_address && (
                  <InfoBlock
                    icon={<MdOutlineLocationOn size={20} />}
                    label="Endereço"
                    value={profile.clinic_address}
                    multiline
                  />
                )}
              </div>
            </div>

            {/* Banner CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-[24px] p-6 md:p-8 border border-blue-100/60 text-center">
              <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
                <h3 className="text-lg font-extrabold text-azul-escuro">
                  Quer ser atendido por {profile.name?.split(" ")[0] || "este especialista"}?
                </h3>
                <p className="text-cinza-claro-texto text-sm leading-relaxed">
                  Crie sua conta gratuita no DiabetesCare para agendar consultas, 
                  acompanhar sua saúde e receber dicas personalizadas.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                  >
                    Criar Conta Grátis
                  </Link>
                  <Link
                    href="/login"
                    className="bg-white text-azul-escuro border border-gray-200 px-8 py-3.5 rounded-full font-bold hover:bg-gray-50 transition-colors"
                  >
                    Fazer Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PublicHeader({ logoHref }: { logoHref: string }) {
  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-[8px] border-b border-gray-100/80 shrink-0"
      style={{ background: "rgba(247, 249, 251, 0.92)" }}
    >
      <div className="w-full max-w-5xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href={logoHref} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group">
          <div className="w-9 h-9 bg-azul-escuro rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-extrabold text-lg text-azul-escuro tracking-tight hidden sm:block">
            DiabetesCare
          </span>
        </Link>

        <div className="flex gap-2 sm:gap-3 items-center">
          <Link
            href="/login"
            className="text-azul font-bold px-4 py-2 text-sm rounded-full hover:bg-blue-50/70 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-5 py-2.5 text-sm rounded-full font-bold shadow-sm hover:bg-blue-700 transition-colors active:scale-[0.97]"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </header>
  );
}

function InfoBlock({
  icon,
  label,
  value,
  highlight,
  multiline,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-[20px] p-4 border border-gray-100 flex items-start gap-4">
      <div className={`mt-0.5 ${highlight ? "text-blue-600" : "text-blue-500"}`}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </span>
        <span
          className={`${highlight ? "text-blue-600 font-bold" : "text-gray-900 font-semibold"} text-sm break-words ${
            multiline ? "whitespace-pre-line leading-snug" : ""
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function ShareButtons({
  name,
  specialty,
}: {
  name: string;
  specialty?: string;
}) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `🌟 ${name}${specialty ? ` — ${specialty}` : ""} | DiabetesCare`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${text}\n\nConfira o perfil completo:`);

  const shareLinks = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: "hover:bg-green-50 hover:text-green-600",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-50 hover:text-blue-600",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: "hover:bg-gray-100 hover:text-gray-800",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-blue-50 hover:text-blue-700",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <MdShare size={14} className="text-gray-400" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Compartilhar
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Compartilhar no ${link.name}`}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-gray-400 border border-gray-200 transition-all duration-200 hover:scale-110 active:scale-95 ${link.color}`}
          >
            {link.icon}
          </a>
        ))}
        <button
          onClick={handleCopyLink}
          title="Copiar link do perfil"
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 hover:scale-110 active:scale-95 ${
            copied
              ? "bg-green-50 text-green-600 border-green-200"
              : "text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-600"
          }`}
        >
          {copied ? <MdCheck size={16} /> : <MdContentCopy size={14} />}
        </button>
      </div>
    </div>
  );
}
