"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import Avatar from "@/components/ui/profile/avatar";
import { getUserProfile, updateUserProfile, deleteUserProfile } from "@/services/user/userService";
import SuccessModal from "@/components/ui/modals/success-modal";
import DeleteAccountModal from "@/components/ui/modals/delete-account-modal";
import { motion, AnimatePresence } from "framer-motion";
import { calculateAge, formatBirthDate, convertBrazilianDateToISO } from "@/lib/age-calculator";
import {
  MdSave,
  MdArrowBack,
  MdOutlineEmail,
  MdLocalPhone,
  MdBadge,
  MdCardMembership,
  MdSchool,
  MdOutlineLocationOn,
  MdFingerprint,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdPerson,
  MdMedicalServices,
  MdBusiness,
  MdEdit,
  MdWarning,
} from "react-icons/md";

const SPECIALTIES = [
  "Endocrinologia",
  "Nutrição Clínica",
  "Educação em Diabetes",
  "Clínica Geral",
  "Cardiologia",
  "Nefrologia",
  "Oftalmologia",
];

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

function InputField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
        {icon && <span className="text-blue-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-300";

const inputWithIconClass =
  "w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 pl-11 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-300";

export default function ProfessionalProfileEdit() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setErrorMsg("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await deleteUserProfile(token);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    } catch (err: any) {
      console.error("Erro ao excluir conta:", err);
      setErrorMsg(err.message ?? "Erro ao excluir conta. Tente novamente.");
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("Masculino");
  const [specialty, setSpecialty] = useState("Endocrinologia");
  const [crm, setCrm] = useState("");
  const [crmUf, setCrmUf] = useState("SP");
  const [education, setEducation] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Avatar separado: URL real do banco vs. preview local
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
        setName(res.user.name || "");
        setEmail(res.user.email || "");
        setPhone(res.user.phone || "");
        setCpf(res.user.cpf || "");
        setBirthDate(res.user.birth_date ? formatBirthDate(res.user.birth_date) : "");
        setGender(res.user.gender || "Masculino");
        setSpecialty(res.user.specialty || "Endocrinologia");
        setCrm(res.user.crm || "");
        setCrmUf(res.user.crm_uf || "SP");
        setEducation(res.user.education || "");
        setClinicAddress(res.user.clinic_address || "");
        setSavedAvatarUrl(res.user.avatar_url || "");
        setAvatarPreview(res.user.avatar_url || "");
      } catch (error) {
        console.error("Erro ao carregar dados para edição:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password && password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }
    if (password && password.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem("token");

    try {
      const isoBirthDate = birthDate ? convertBrazilianDateToISO(birthDate) : null;
      if (birthDate && !isoBirthDate) {
        setErrorMsg("Data de nascimento inválida. Use o formato DD/MM/AAAA.");
        setIsSaving(false);
        return;
      }

      const updateData: any = {
        name,
        email,
        phone,
        cpf,
        birth_date: isoBirthDate,
        gender,
        specialty,
        crm,
        crm_uf: crmUf,
        education,
        clinic_address: clinicAddress,
        avatar_url: avatarPreview || null,
      };

      if (password) updateData.password = password;

      const response = await updateUserProfile(updateData, token);

      if (!response || response.error) {
        throw new Error(response?.error || "Erro ao salvar dados no servidor");
      }

      setShowSuccess(true);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Erro ao salvar as informações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
      <div className="max-w-5xl mx-auto w-full bg-[#F8F9FA] min-h-screen relative flex flex-col">
        <Header title="DiabetesCare" titleColor="var(--dc-azul)" variant="page" showNotification={false} />

        <div className="flex-1 px-4 md:px-6 py-6">
          {/* Page Title */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl font-bold text-gray-900">Editar Perfil Profissional</h2>
            <p className="text-gray-400 text-sm mt-1">Mantenha suas informações clínicas atualizadas</p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium"
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

              {/* LEFT COLUMN — Avatar & Cancel */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="md:col-span-1 bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center gap-4"
              >
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2">
                  {isLoading ? (
                    <div className="w-[108px] h-[108px] rounded-full bg-gray-100 animate-pulse" />
                  ) : (
                    <Avatar
                      src={avatarPreview}
                      mode="edit"
                      size={108}
                      onImageSelected={(file) => {
                        setAvatarFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAvatarPreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  )}
                  <span className="text-blue-600 text-xs font-semibold">Alterar Foto</span>
                  {avatarFile && (
                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                      Nova foto selecionada
                    </span>
                  )}
                </div>

                <div className="w-full h-px bg-gray-100" />

                {/* Name + badge */}
                <div className="text-center w-full">
                  {isLoading ? (
                    <>
                      <div className="h-5 w-32 bg-gray-100 animate-pulse rounded-lg mx-auto" />
                      <div className="h-4 w-24 bg-gray-100 animate-pulse rounded-full mx-auto mt-2" />
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-gray-900 text-base">{name || "Seu Nome"}</p>
                      <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full mt-1 tracking-wide uppercase">
                        {specialty || "Profissional de Saúde"}
                      </span>
                    </>
                  )}
                </div>

                {/* CRM Preview */}
                {(crm || crmUf) && (
                  <div className="w-full bg-gray-50 rounded-2xl p-3 text-center">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Registro</p>
                    <p className="text-gray-700 font-bold text-sm mt-0.5">
                      {crm} — {crmUf}
                    </p>
                  </div>
                )}

                {/* Cancel */}
                <Link
                  href="/professional/profile"
                  className="w-full flex items-center justify-center gap-2 mt-2 py-3 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  <MdArrowBack size={18} />
                  Cancelar e Voltar
                </Link>

                <div className="w-full h-px bg-gray-100 my-2" />

                {/* ── Zona de Perigo ── */}
                <div className="w-full bg-gradient-to-br from-red-50/80 via-rose-50/40 to-red-50/30 rounded-2xl border border-red-100 p-5 text-center flex flex-col gap-3 mt-4 shadow-[0_8px_20px_rgba(239,68,68,0.04)] hover:shadow-[0_8px_24px_rgba(239,68,68,0.06)] transition-all">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center justify-center gap-2 m-0">
                    <MdWarning className="text-red-500 animate-pulse" size={16} /> Zona de Perigo
                  </p>
                  <p className="text-[11.5px] text-red-700/80 leading-relaxed font-semibold m-0 text-center">
                    A exclusão da conta é permanente e removerá de forma definitiva todas as suas informações clínicas, publicações e registros do sistema.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold hover:shadow-[0_4px_12px_rgba(220,38,38,0.25)] active:scale-[0.98] transition-all duration-200 mt-1 flex items-center justify-center gap-2"
                  >
                    Excluir Minha Conta
                  </button>
                </div>
              </motion.div>

              {/* RIGHT COLUMN — Form */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 }}
                className="md:col-span-2 flex flex-col gap-5"
              >
                {isLoading ? (
                  <div className="bg-white rounded-[28px] border border-gray-100 p-6 flex flex-col gap-4 animate-pulse">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Section: Identificação */}
                    <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                        <MdPerson size={16} className="text-blue-500" /> Identificação
                      </h3>
                      <div className="flex flex-col gap-4">
                        {/* Nome */}
                        <InputField label="Nome Completo">
                          <div className="relative">
                            <MdBadge className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Dr. Nome Completo"
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-300"
                              required
                            />
                            <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          </div>
                        </InputField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* CPF */}
                          <InputField label="CPF">
                            <div className="relative">
                              <MdFingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                              <input
                                type="text"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                placeholder="000.000.000-00"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-300"
                              />
                              <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            </div>
                          </InputField>

                          {/* Data de Nascimento */}
                          <InputField label="Data de Nascimento (DD/MM/AAAA)">
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={10}
                                placeholder="DD/MM/AAAA"
                                value={birthDate}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const clean = val.replace(/\D/g, "");
                                  let formatted = "";
                                  if (clean.length > 0) {
                                    formatted += clean.substring(0, 2);
                                    if (clean.length > 2) {
                                      formatted += "/" + clean.substring(2, 4);
                                      if (clean.length > 4) {
                                        formatted += "/" + clean.substring(4, 8);
                                      }
                                    }
                                  }
                                  setBirthDate(formatted);
                                }}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 pr-11 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-300"
                              />
                              <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            </div>
                          </InputField>

                          {/* Gênero */}
                          <InputField label="Gênero">
                            <div className="relative">
                              <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all cursor-pointer"
                              >
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outro">Outro</option>
                                <option value="Prefiro não informar">Prefiro não informar</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              </div>
                            </div>
                          </InputField>

                          {/* Idade (Calculada automaticamente) */}
                          <InputField label="Idade">
                            <input
                              type="text"
                              value={
                                birthDate && convertBrazilianDateToISO(birthDate)
                                  ? `${calculateAge(convertBrazilianDateToISO(birthDate)!)} anos`
                                  : "Não informada"
                              }
                              readOnly
                              disabled
                              className="w-full bg-gray-100 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-600 font-medium cursor-not-allowed focus:outline-none"
                            />
                          </InputField>
                        </div>
                      </div>
                    </div>

                    {/* Section: Atuação Clínica */}
                    <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                        <MdMedicalServices size={16} className="text-blue-500" /> Atuação Clínica
                      </h3>
                      <div className="flex flex-col gap-4">
                        {/* Especialidade */}
                        <InputField label="Especialidade">
                          <select
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            className={`${inputClass} cursor-pointer`}
                          >
                            {SPECIALTIES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </InputField>

                        {/* CRM / CRN + UF */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <InputField label="Número de Registro (CRM/CRN)">
                              <div className="relative">
                                <MdCardMembership className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                  type="text"
                                  value={crm}
                                  onChange={(e) => setCrm(e.target.value)}
                                  placeholder="Ex: 123456"
                                  className={`${inputWithIconClass} pr-11`}
                                />
                                <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
                              </div>
                            </InputField>
                          </div>
                          <div className="col-span-1">
                            <InputField label="UF">
                              <select
                                value={crmUf}
                                onChange={(e) => setCrmUf(e.target.value)}
                                className={`${inputClass} cursor-pointer uppercase`}
                              >
                                {ESTADOS_BR.map((uf) => (
                                  <option key={uf} value={uf}>{uf}</option>
                                ))}
                              </select>
                            </InputField>
                          </div>
                        </div>

                        {/* Formação */}
                        <InputField label="Instituição / Titulação">
                          <div className="relative">
                            <MdSchool className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                              type="text"
                              value={education}
                              onChange={(e) => setEducation(e.target.value)}
                              placeholder="Ex: Residência em Endocrinologia — USP"
                              className={`${inputWithIconClass} pr-11`}
                            />
                            <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
                          </div>
                        </InputField>
                      </div>
                    </div>

                    {/* Section: Contato */}
                    <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                        <MdOutlineEmail size={16} className="text-blue-500" /> Contato
                      </h3>
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Email */}
                          <InputField label="E-mail Corporativo">
                            <div className="relative">
                              <MdOutlineEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`${inputWithIconClass} pr-11`}
                                required
                              />
                              <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
                            </div>
                          </InputField>

                          {/* Telefone */}
                          <InputField label="Telefone / WhatsApp">
                            <div className="relative">
                              <MdLocalPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(11) 99999-0000"
                                className={`${inputWithIconClass} pr-11`}
                              />
                              <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
                            </div>
                          </InputField>
                        </div>

                        {/* Endereço do Consultório */}
                        <InputField label="Endereço do Consultório">
                          <div className="relative">
                            <MdOutlineLocationOn className="absolute left-3.5 top-5 text-gray-300" size={18} />
                            <textarea
                              value={clinicAddress}
                              onChange={(e) => setClinicAddress(e.target.value)}
                              placeholder={`Av. Paulista, 1000 - Sala 42\nSão Paulo, SP`}
                              rows={3}
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all resize-none placeholder:text-gray-300"
                            />
                            <MdEdit className="absolute right-4 top-5 text-gray-300 pointer-events-none" size={18} />
                          </div>
                        </InputField>
                      </div>
                    </div>

                    {/* Section: Segurança */}
                    <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                        <MdLock size={16} className="text-blue-500" /> Segurança
                      </h3>
                      <p className="text-gray-400 text-xs mb-5">Deixe em branco para manter a senha atual.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Nova Senha */}
                        <InputField label="Nova Senha">
                          <div className="relative">
                            <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Mínimo 6 caracteres"
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 pl-11 pr-12 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                              {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                            </button>
                          </div>
                        </InputField>

                        {/* Confirmar Senha */}
                        <InputField label="Confirmar Nova Senha">
                          <div className="relative">
                            <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repita a nova senha"
                              className={`w-full bg-gray-50 border rounded-2xl px-4 py-3.5 pl-11 pr-12 text-gray-900 font-medium focus:outline-none focus:ring-2 transition-all focus:bg-white placeholder:text-gray-300 ${confirmPassword && password !== confirmPassword
                                  ? "border-red-200 focus:ring-red-100"
                                  : "border-gray-100 focus:ring-blue-200 focus:border-blue-400"
                                }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                              {showConfirmPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                            </button>
                          </div>
                          {confirmPassword && password !== confirmPassword && (
                            <p className="text-red-500 text-xs px-1">As senhas não coincidem</p>
                          )}
                        </InputField>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-base transition-all shadow-lg ${isSaving
                          ? "bg-gray-400 cursor-not-allowed shadow-none"
                          : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25 active:scale-[0.99]"
                        }`}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Salvando dados...
                        </>
                      ) : (
                        <>
                          <MdSave size={20} />
                          Salvar Modificações
                        </>
                      )}
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </form>
        </div>

        <Footer />
      </div>

      <SuccessModal
        isOpen={showSuccess}
        message="Suas informações profissionais foram atualizadas com sucesso."
        onClose={() => {
          setShowSuccess(false);
          router.push("/professional/profile");
        }}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeletingAccount}
      />
    </main>
  );
}