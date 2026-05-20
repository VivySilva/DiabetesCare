"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import Avatar from "@/components/ui/profile/avatar";
import { getUserProfile, updateUserProfile } from "@/services/user/userService";
import {
  MdSave,
  MdArrowBack,
  MdOutlineEmail,
  MdLocalPhone,
  MdBadge,
  MdCardMembership,
  MdSchool,
  MdOutlineLocationOn,
  MdFingerprint
} from "react-icons/md";

export default function ProfessionalProfileEdit() {
  const router = useRouter();

  // Estados de controle da página
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados dos campos vindos do Banco de Dados
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [crm, setCrm] = useState("");
  const [crmUf, setCrmUf] = useState("");
  const [education, setEducation] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");

  // Carrega todos os dados atuais do profissional de saúde
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // CORRIGIDO: Passando o token no GET para autorizar a busca no back-end
        const res = await getUserProfile(token);
        setUser(res.user);

        // Populando os inputs com o registro atual do BD
        setName(res.user.name || "");
        setEmail(res.user.email || "");
        setPhone(res.user.phone || "");
        setCpf(res.user.cpf || "");
        setBirthDate(res.user.birth_date || "");
        setSpecialty(res.user.specialty || "Endocrinologia");
        setCrm(res.user.crm || "");
        setCrmUf(res.user.crm_uf || "SP");
        setEducation(res.user.education || "");
        setClinicAddress(res.user.clinic_address || "");
      } catch (error) {
        console.error("Erro ao carregar dados para edição:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Envia as alterações para a rota da API interna do Next.js
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem("token");

    try {
      const updateData = {
        name,
        email,
        phone,
        cpf,
        birth_date: birthDate,
        specialty,
        crm,
        crm_uf: crmUf,
        education,
        clinic_address: clinicAddress,
      };

      // Executa o serviço enviando os dados e o token
      const response = await updateUserProfile(updateData, token);

      // CORRIGIDO: Validação baseada no retorno formatado do Service utilitário
      if (!response || response.error) {
        throw new Error(response?.error || "Erro ao salvar dados no servidor");
      }

      // Sucesso: Retorna para o perfil atualizado
      router.push("/professional/profile");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar as informações. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
      <div className="max-w-5xl mx-auto w-full bg-[#F8F9FA] min-h-screen relative flex flex-col">
        <Header title="DiabetesCare" titleColor="var(--dc-azul)" variant="page" showNotification={false} />

        {/* Grid de Edição Coeso com a Tela de Visualização */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 px-6 pb-12 items-start">

          {/* Lateral Esquerda: Avatar e Retorno */}
          <div className="md:col-span-1 flex flex-col items-center bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <Avatar mode="edit" src={user?.avatar_url} />

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
              <span>Cancelar e Voltar</span>
            </Link>
          </div>

          {/* Lateral Direita (2 Colunas): Formulário Completo de Cadastro */}
          <div className="md:col-span-2 bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-1 mb-6 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Editar Informações Profissionais</h3>
              <p className="text-gray-400 text-xs">Atualize os dados que ficarão visíveis para a clínica e pacientes.</p>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-5 animate-pulse">
                <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
                <div className="h-12 bg-gray-100 rounded-2xl w-1/2"></div>
                <div className="h-24 bg-gray-100 rounded-2xl w-full"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Seção 1: Identificação */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <MdBadge size={20} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">CPF</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <MdFingerprint size={20} />
                      </div>
                      <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Seção 2: Atuação Clínica */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Especialidade</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="Endocrinologia">Endocrinologia</option>
                      <option value="Nutrição Clínica">Nutrição Clínica</option>
                      <option value="Educação em Diabetes">Educação em Diabetes</option>
                      <option value="Clínica Geral">Clínica Geral</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Número Registro (CRM/CRN)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <MdCardMembership size={20} />
                      </div>
                      <input
                        type="text"
                        value={crm}
                        onChange={(e) => setCrm(e.target.value)}
                        placeholder="Ex: 123456"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">UF do Registro</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={crmUf}
                      onChange={(e) => setCrmUf(e.target.value.toUpperCase())}
                      placeholder="SP"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Instituição de Ensino / Titulação</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <MdSchool size={20} />
                    </div>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="Ex: Residência Médica em Endocrinologia - USP"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Seção 3: Contatos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">E-mail Corporativo</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <MdOutlineEmail size={20} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Telefone / WhatsApp</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <MdLocalPhone size={20} />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 99999-0000"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Endereço do Consultório</label>
                  <div className="relative">
                    <div className="absolute left-4 top-6 text-gray-400">
                      <MdOutlineLocationOn size={20} />
                    </div>
                    <textarea
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      placeholder="Av. Paulista, 1000 - Sala 42&#10;São Paulo, SP"
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none leading-normal"
                    />
                  </div>
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] mt-4 ${isSaving ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando dados...
                    </span>
                  ) : (
                    <>
                      <span>Salvar Modificações</span>
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