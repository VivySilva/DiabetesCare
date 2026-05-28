"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/profile/avatar";
import InfoCard from "@/components/ui/profile/info-card";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import LogoutModal from "@/components/ui/modals/logout-modal";
import { getUserProfile } from "@/services/user/userService";
import { calculateAge } from "@/lib/age-calculator";
import {
  MdSchool,
  MdOutlineEmail,
  MdOutlinePhone,
  MdOutlineLocationOn,
  MdLogout,
  MdCardMembership,
  MdEdit,
  MdAssignmentInd,
} from "react-icons/md";

export default function ProfessionalProfile() {
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await getUserProfile(token);
        // Resgata o objeto do usuário vindo do banco de dados
        setUser(res.user);
      } catch (error) {
        console.error("Erro ao carregar perfil do profissional:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
      <div className="max-w-5xl mx-auto w-full bg-[#F8F9FA] min-h-screen relative flex flex-col">
        <Header title="Perfil Profissional" variant="page" showNotification={true} />

        {/* Layout em Grid Responsivo */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 px-6 pb-12 items-start">

          {/* Coluna 1: Avatar, Resumo e Ações (Editar / Sair) */}
          <div className="md:col-span-1 flex flex-col items-center bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <Link href="/professional/profile/edit" className="transition-transform hover:scale-105">
              <Avatar mode="view" src={user?.avatar_url} />
            </Link>

            {isLoading ? (
              <div className="flex flex-col items-center mt-4 gap-2 w-full">
                <div className="h-6 w-32 bg-gray-100 animate-pulse rounded-lg"></div>
                <div className="h-5 w-24 bg-gray-100 animate-pulse rounded-full"></div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mt-4 text-center">
                  {user?.name || "Especialista"}
                </h2>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full mt-2 tracking-wide uppercase">
                  {user?.role === "PROFESSIONAL" ? "Especialista" : "Membro Clínico"}
                </span>
              </>
            )}

            {/* Menu de Ações Rápidas */}
            <div className="w-full bg-gray-50 rounded-[24px] p-2 mt-6 flex flex-col gap-1">
              {/* BOTÃO EDITAR PERFIL IMPLEMENTADO */}
              <Link
                href="/professional/profile/edit"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-semibold text-sm transition-all border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <MdEdit size={20} />
                  <span>Editar Perfil</span>
                </div>
                <span className="text-blue-400 text-sm">›</span>
              </Link>

              <button
                onClick={() => setIsLogoutOpen(true)}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-transparent hover:bg-red-50 text-red-600 font-semibold text-sm transition-colors w-full"
              >
                <MdLogout size={20} />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>

          {/* Colunas 2 & 3: Exibição Completa de Dados Cadastrados no BD */}
          <div className="md:col-span-2 flex flex-col gap-6 bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">

            {/* Bloco 1: Dados Pessoais de Cadastro */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 pb-3 border-b border-gray-100">Informações Básicas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard label="Idade" value={user?.birth_date ? `${calculateAge(user.birth_date)} anos` : "Não informado"} />
                <InfoCard label="Gênero" value={user?.gender || "Não informado"} />
                <InfoCard label="CPF" value={user?.cpf || "Não informado"} />
              </div>
            </div>

            {/* Bloco 2: Atuação Clínica e Credenciais coletadas no Registro */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Credenciais & Atuação Profissional
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Especialidade cadastrada */}
                <div className="bg-gray-50 rounded-[20px] p-4 border border-gray-100 flex items-start gap-4">
                  <div className="text-blue-600 mt-0.5">
                    <MdAssignmentInd size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Especialidade Principal
                    </span>
                    <span className="text-gray-900 font-semibold text-sm">
                      {user?.specialty || "Não informada"}
                    </span>
                  </div>
                </div>

                {/* CRM / Registro de Classe */}
                <div className="bg-gray-50 rounded-[20px] p-4 border border-gray-100 flex items-start gap-4">
                  <div className="text-blue-600 mt-0.5">
                    <MdCardMembership size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Registro (CRM / CRN)
                    </span>
                    <span className="text-blue-600 font-bold text-base">
                      {user?.license_number || "Não informado"}
                    </span>
                  </div>
                </div>

                {/* Instituição / Formação Acadêmica */}
                <div className="bg-gray-50 rounded-[20px] p-4 border border-gray-100 flex items-start gap-4 sm:col-span-2">
                  <div className="text-blue-600 mt-0.5">
                    <MdSchool size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Instituição de Formação / Titulação
                    </span>
                    <span className="text-gray-900 font-semibold text-sm">
                      {user?.education || "Não informada no cadastro"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 3: Informações de Contato e Localização */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Contatos e Localização Registrada
              </h3>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-[20px] p-4 border border-gray-100 flex items-center gap-4">
                    <div className="text-blue-600">
                      <MdOutlineEmail size={22} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        E-mail de Login / Contato
                      </span>
                      <span className="text-gray-900 font-semibold text-sm break-all">
                        {user?.email || "Não informado"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-[20px] p-4 border border-gray-100 flex items-center gap-4">
                    <div className="text-blue-600">
                      <MdOutlinePhone size={22} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        Telefone Comercial
                      </span>
                      <span className="text-gray-900 font-semibold text-sm">
                        {user?.phone || "Não informado"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Local de Atendimento */}
                <div className="bg-gray-50 rounded-[20px] p-4 border border-gray-100 flex items-start gap-4">
                  <div className="text-blue-600 mt-0.5">
                    <MdOutlineLocationOn size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Endereço do Consultório / Clínica
                    </span>
                    <span className="text-gray-900 font-semibold text-sm leading-snug">
                      {user?.clinic_address ? (
                        user.clinic_address.split('\n').map((line: string, index: number) => (
                          <span key={index}>{line}<br /></span>
                        ))
                      ) : (
                        "Endereço não cadastrado"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </section>

        <LogoutModal
          isOpen={isLogoutOpen}
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={() => {
            setIsLogoutOpen(false);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }}
        />

        <Footer />
      </div>
    </main>
  );
}