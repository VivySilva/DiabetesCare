"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import Avatar from "@/components/ui/profile/avatar";
import { getUserProfile, updateUserProfile } from "@/services/user/userService"; // Mantendo seu service centralizado
import { MdSave, MdArrowBack, MdOutlineEmail, MdLocalPhone, MdBadge, MdCardMembership } from "react-icons/md";

export default function ProfessionalProfileEdit() {
  const router = useRouter();

  // Estados de controle e dados do usuário
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados dos campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("Endocrinologia");
  const [crm, setCrm] = useState("");

  // Carregar dados iniciais idêntico à tela do paciente
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await getUserProfile(token);
        setUser(res.user);

        // Populando os campos do formulário
        setName(res.user.name || "");
        setEmail(res.user.email || "");
        setPhone(res.user.phone || "");
        setSpecialty(res.user.specialty || "Endocrinologia");
        setCrm(res.user.crm || "");
      } catch (error) {
        console.error("Erro ao carregar perfil do profissional:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem("token");

    try {
      // Integração com a API centralizada para salvar as alterações
      await updateUserProfile({
        name,
        email,
        phone,
        specialty,
        crm,
      }, token);

      // Redireciona de volta para o perfil do profissional após salvar
      router.push("/professional/profile");
    } catch (error) {
      console.error(error);
      alert("Houve um problema ao salvar as alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
      {/* Container Centralizado Max-Width idêntico ao Perfil */}
      <div className="max-w-5xl mx-auto w-full bg-[#F8F9FA] min-h-screen relative flex flex-col">
        <Header title="DiabetesCare" titleColor="var(--dc-azul)" variant="page" showNotification={false} />

        {/* Grid Layout Responsivo */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 px-6 pb-12 items-start">

          {/* Coluna 1: Avatar e Botão de Voltar */}
          <div className="md:col-span-1 flex flex-col items-center bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="relative group cursor-pointer">
              <Avatar mode="edit" src={user?.avatar_url} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-4 text-center">
              {isLoading ? "Carregando..." : name || "Especialista"}
            </h2>
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full mt-2 tracking-wide uppercase">
              Profissional de Saúde
            </span>

            <Link
              href="/professional/profile"
              className="mt-6 flex items-center justify-center gap-2 w-full p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors border border-gray-100"
            >
              <MdArrowBack size={20} />
              <span>Voltar ao Perfil</span>
            </Link>
          </div>

          {/* Colunas 2 & 3: Formulário de Edição de Informações */}
          <div className="md:col-span-2 bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-1 mb-6 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Editar Informações</h3>
              <p className="text-gray-400 text-xs">Mantenha seus dados profissionais atualizados na plataforma.</p>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
                <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
                <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Nome Completo */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <MdBadge size={20} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>

                {/* Grid Duplo: Especialidade e Registro (CRM) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Especialidade */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Especialidade</label>
                    <div className="relative">
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 appearance-none focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner cursor-pointer"
                      >
                        <option value="Endocrinologia">Endocrinologia</option>
                        <option value="Nutrição Clínica">Nutrição Clínica</option>
                        <option value="Educação em Diabetes">Educação em Diabetes</option>
                        <option value="Clínica Geral">Clínica Geral</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* CRM / Registro */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Registro / CRM</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <MdCardMembership size={20} />
                      </div>
                      <input
                        type="text"
                        value={crm}
                        onChange={(e) => setCrm(e.target.value)}
                        placeholder="Ex: CRM/SP 123456"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* E-mail */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">E-mail Corporativo</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <MdOutlineEmail size={20} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Telefone / WhatsApp</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <MdLocalPhone size={20} />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Botão Salvar Customizado igual ao padrão de carregamento */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] mt-4 ${isSaving ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando Alterações...
                    </span>
                  ) : (
                    <>
                      <span>Salvar Informações</span>
                      <MdSave size={20} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </section>

        <Footer />
      </div>
    </main>
  );
}