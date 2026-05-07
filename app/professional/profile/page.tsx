"use client";
import { useState } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/profile/avatar";
import InfoCard from "@/components/ui/profile/info-card";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import LogoutModal from "@/components/ui/modals/logout-modal";
import {
  MdSchool,
  MdOutlineEmail,
  MdOutlinePhone,
  MdOutlineLocationOn,
  MdLogout,
} from "react-icons/md";
import { useRouter } from "next/navigation";

export default function ProfessionalProfile() {
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px]">
      <div className="max-w-md mx-auto w-full bg-[#F8F9FA] min-h-screen relative">
        <Header title="DiabetesCare" titleColor="var(--dc-azul)" variant="page" />

        {/* Topo do Perfil */}
        <section className="flex flex-col items-center mt-4 px-6">
          <Link href="/professional/edit">
            <Avatar mode="view" />
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Ricardo Oliveira
          </h2>

          <div className="flex w-full gap-4 mt-6">
            <InfoCard label="Idade" value="42 anos" />
            <InfoCard label="Gênero" value="Masculino" />
          </div>
        </section>

        {/* Seção: Credenciais & Formação */}
        <section className="mt-8 px-6">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Credenciais & Formação
          </h3>

          <div className="flex flex-col gap-3">
            {/* Card Formação */}
            <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex items-start gap-4">
              <div className="text-blue-600 mt-0.5">
                <MdSchool size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Formação
                </span>
                <span className="text-gray-900 font-semibold">
                  USP - Residência em endocrinologia
                </span>
              </div>
            </div>

            {/* Card CRM */}
            <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                CRM
              </span>
              <span className="text-blue-600 font-bold text-lg">123456-SP</span>
            </div>
          </div>
        </section>

        {/* Seção: Informações de Contato */}
        <section className="mt-8 px-6">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Informações de Contato
          </h3>

          <div className="flex flex-col gap-3">
            {/* Card Email */}
            <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center gap-4">
              <div className="text-blue-600">
                <MdOutlineEmail size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  E-mail Profissional
                </span>
                <span className="text-gray-900 font-semibold">
                  ricardo.med@clinica.com
                </span>
              </div>
            </div>

            {/* Card Telefone */}
            <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center gap-4">
              <div className="text-blue-600">
                <MdOutlinePhone size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Telefone
                </span>
                <span className="text-gray-900 font-semibold">
                  (11) 99887-6655
                </span>
              </div>
            </div>

            {/* Card Endereço */}
            <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex items-start gap-4">
              <div className="text-blue-600 mt-0.5">
                <MdOutlineLocationOn size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Endereço Clínico
                </span>
                <span className="text-gray-900 font-semibold leading-snug">
                  Av. Paulista, 1000 - Sala 42.
                  <br />
                  São Paulo, SP
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Botão Sair da Conta */}
        <section className="mt-10 px-6">
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="w-full bg-gray-100/80 hover:bg-gray-200 text-red-600 font-semibold py-4 rounded-[24px] flex items-center justify-center gap-2 transition-colors"
          >
            <MdLogout size={20} className="rotate-180" />
            <span>Sair da Conta</span>
          </button>
        </section>

        {/* Modal de Logout */}
        <LogoutModal
          isOpen={isLogoutOpen}
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={() => router.push("/login")}
        />

        {/* Footer Inteligente */}
        <Footer />
      </div>
    </main>
  );
}
