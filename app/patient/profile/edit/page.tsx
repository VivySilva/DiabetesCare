"use client";
import React, { useState, useEffect } from "react";
import Avatar from "@/components/ui/profile/avatar";
import {
  MdEdit,
  MdEmail,
  MdPhone,
  MdPerson,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdArrowBack,
  MdSave,
  MdBloodtype,
  MdCheckCircle,
  MdWarning,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import { getUserProfile, updateUserProfile, deleteUserProfile } from "@/services/user/userService";
import SuccessModal from "@/components/ui/modals/success-modal";
import DeleteAccountModal from "@/components/ui/modals/delete-account-modal";
import { motion, AnimatePresence } from "framer-motion";
import { calculateAge, formatBirthDate, convertBrazilianDateToISO } from "@/lib/age-calculator";

const DIABETES_TYPES = [
  { value: "Tipo 1",       label: "Tipo 1" },
  { value: "Tipo 2",       label: "Tipo 2" },
  { value: "Gestacional",  label: "Gestacional" },
  { value: "Pré-diabetes", label: "Pré-diabetes" },
];

export default function EditPatientProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading]       = useState(true);
  const [isSaving, setIsSaving]         = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [error, setError]               = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setError("");

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
      setError(err.message ?? "Erro ao excluir conta. Tente novamente.");
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Campos do formulário
  const [name, setName]               = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender]           = useState("Masculino");
  const [phone, setPhone]             = useState("");
  const [email, setEmail]             = useState("");
  const [diabetesType, setDiabetesType] = useState("Tipo 2");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Avatar: guardamos a URL original do banco separada do preview local
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string>("");   // URL real salva no banco
  const [avatarPreview, setAvatarPreview]   = useState<string>("");   // Preview (pode ser base64)
  const [avatarFile, setAvatarFile]         = useState<File | null>(null); // Arquivo novo selecionado

  // ─── Carrega perfil atual ────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }

      try {
        const res = await getUserProfile(token);
        const u = res.user;
        setName(u.name ?? "");
        setDateOfBirth(u.birth_date ? formatBirthDate(u.birth_date) : "");
        setGender(u.gender ?? "Masculino");
        setPhone(u.phone ?? "");
        setEmail(u.email ?? "");
        setDiabetesType(u.diabetes_type ?? "Tipo 2");
        setSavedAvatarUrl(u.avatar_url ?? "");
        setAvatarPreview(u.avatar_url ?? "");
      } catch (err: any) {
        console.error("Erro ao carregar perfil:", err);
        setError("Não foi possível carregar os dados do perfil.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  // ─── Submissão do formulário ─────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações client-side
    if (!name.trim()) { setError("O nome não pode estar vazio."); return; }
    if (!email.trim()) { setError("O e-mail não pode estar vazio."); return; }
    if (password && password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setIsSaving(true);

    try {
      const isoBirthDate = dateOfBirth ? convertBrazilianDateToISO(dateOfBirth) : null;
      if (dateOfBirth && !isoBirthDate) {
        setError("Data de nascimento inválida. Use o formato DD/MM/AAAA.");
        setIsSaving(false);
        return;
      }

      // Monta o payload — avatar_url é enviado diretamente como base64 se selecionado do PC
      const payload: Record<string, any> = {
        name:          name.trim(),
        email:         email.trim(),
        phone:         phone.trim() || null,
        gender,
        diabetes_type: diabetesType,
        birth_date:    isoBirthDate,
        avatar_url:    avatarPreview || null,
      };

      // Senha só se o usuário preencheu
      if (password) {
        payload.password = password;
      }

      await updateUserProfile(payload, token);
      setShowSuccess(true);
    } catch (err: any) {
      console.error("Erro ao salvar perfil:", err);
      setError(err.message ?? "Erro ao salvar alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Carregando perfil...</p>
        </div>
      </main>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
      <div className="max-w-5xl mx-auto w-full min-h-screen flex flex-col">
        <Header
          title="Edição de Perfil"
          variant="page"
          showNotification={false}
        />

        <div className="flex-1 px-4 md:px-6 py-6">
          {/* Título */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl font-bold text-gray-900">Editar Perfil</h2>
            <p className="text-gray-400 text-sm mt-1">
              Atualize suas informações pessoais e de saúde
            </p>
          </div>

          <form onSubmit={handleSave} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

              {/* ── COLUNA ESQUERDA: Avatar + Tipo de Diabetes ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="md:col-span-1 bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center gap-5"
              >
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2">
                  <Avatar
                    src={avatarPreview}
                    mode="edit"
                    size={108}
                    onImageSelected={(file) => {
                      setAvatarFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        // Preview local (base64) — NÃO vai para o banco diretamente
                        setAvatarPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <span className="text-blue-600 text-xs font-semibold">
                    Alterar Foto
                  </span>
                  {avatarFile && (
                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                      Nova foto selecionada
                    </span>
                  )}
                </div>

                <div className="w-full h-px bg-gray-100" />

                {/* Preview do nome */}
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base leading-tight">
                    {name || "Seu Nome"}
                  </p>
                  <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full mt-2 tracking-wide uppercase">
                    {diabetesType}
                  </span>
                </div>

                {/* Seletor de Tipo de Diabetes */}
                <div className="w-full">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <MdBloodtype size={14} /> Tipo de Diabetes
                  </p>
                  <div className="flex flex-col gap-2">
                    {DIABETES_TYPES.map((tipo) => {
                      const selected = diabetesType === tipo.value;
                      return (
                        <label
                          key={tipo.value}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selected
                              ? "border-blue-300 bg-blue-50"
                              : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="radio"
                            name="diabetesType"
                            value={tipo.value}
                            checked={selected}
                            onChange={() => setDiabetesType(tipo.value)}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span
                            className={`text-sm font-semibold ${
                              selected ? "text-blue-700" : "text-gray-700"
                            }`}
                          >
                            {tipo.label}
                          </span>
                          {selected && (
                            <MdCheckCircle className="ml-auto text-blue-500" size={16} />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Botão cancelar */}
                <button
                  type="button"
                  onClick={() => router.push("/patient/profile")}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  <MdArrowBack size={18} />
                  Cancelar e Voltar
                </button>

                <div className="w-full h-px bg-gray-100 my-2" />

                {/* ── Zona de Perigo ── */}
                <div className="w-full bg-gradient-to-br from-red-50/80 via-rose-50/40 to-red-50/30 rounded-2xl border border-red-100 p-5 text-center flex flex-col gap-3 mt-4 shadow-[0_8px_20px_rgba(239,68,68,0.04)] hover:shadow-[0_8px_24px_rgba(239,68,68,0.06)] transition-all">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center justify-center gap-2 m-0">
                    <MdWarning className="text-red-500 animate-pulse" size={16} /> Zona de Perigo
                  </p>
                  <p className="text-[11.5px] text-red-700/80 leading-relaxed font-semibold m-0 text-center">
                    A exclusão da conta é permanente e removerá de forma definitiva todas as suas informações, histórico de glicose e registros do sistema.
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

              {/* ── COLUNA DIREITA: Formulário ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 }}
                className="md:col-span-2 flex flex-col gap-5"
              >
                {/* Banner de erro */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium flex items-start gap-2"
                    >
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Card: Dados Pessoais ── */}
                <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <MdPerson size={16} className="text-blue-500" /> Dados Pessoais
                  </h3>
                  <div className="flex flex-col gap-4">

                    {/* Nome */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                        Nome Completo *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Seu nome completo"
                          required
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 pr-11 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                        />
                        <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      </div>
                    </div>

                     {/* Data de Nascimento + Idade */}
                     <div className="grid grid-cols-2 gap-4">
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                           Data de Nascimento (DD/MM/AAAA)
                         </label>
                         <div className="relative">
                           <input
                             type="text"
                             maxLength={10}
                             placeholder="DD/MM/AAAA"
                             value={dateOfBirth}
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
                               setDateOfBirth(formatted);
                             }}
                             className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 pr-11 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                           />
                           <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                         </div>
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                           Idade
                         </label>
                         <input
                           type="text"
                           value={
                             dateOfBirth && convertBrazilianDateToISO(dateOfBirth)
                               ? `${calculateAge(convertBrazilianDateToISO(dateOfBirth)!)} anos`
                               : "Não informada"
                           }
                           readOnly
                           disabled
                           className="w-full bg-gray-100 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-600 font-medium focus:outline-none cursor-not-allowed"
                         />
                       </div>
                     </div>

                    {/* Gênero */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                        Gênero
                      </label>
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
                    </div>
                  </div>
                </div>

                {/* ── Card: Contato ── */}
                <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <MdEmail size={16} className="text-blue-500" /> Contato
                  </h3>
                  <div className="flex flex-col gap-4">

                    {/* E-mail */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                        E-mail *
                      </label>
                      <div className="relative">
                        <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          required
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                        />
                        <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      </div>
                    </div>

                    {/* Telefone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                        Telefone / WhatsApp
                      </label>
                      <div className="relative">
                        <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                        />
                        <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Card: Segurança ── */}
                <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <MdLock size={16} className="text-blue-500" /> Segurança
                  </h3>
                  <p className="text-gray-400 text-xs mb-5">
                    Deixe em branco para manter a senha atual.
                  </p>
                  <div className="flex flex-col gap-4">

                    {/* Nova Senha */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                        Nova Senha
                      </label>
                      <div className="relative">
                        <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          autoComplete="new-password"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 pl-11 pr-12 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirmar Senha */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                        Confirmar Nova Senha
                      </label>
                      <div className="relative">
                        <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repita a nova senha"
                          autoComplete="new-password"
                          className={`w-full bg-gray-50 border rounded-2xl px-4 py-3.5 pl-11 pr-12 text-gray-900 font-medium focus:outline-none focus:ring-2 transition-all focus:bg-white ${
                            confirmPassword && password !== confirmPassword
                              ? "border-red-200 focus:ring-red-100"
                              : "border-gray-100 focus:ring-blue-200 focus:border-blue-400"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                          aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showConfirmPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-red-500 text-xs px-1">As senhas não coincidem</p>
                      )}
                      {confirmPassword && password === confirmPassword && password.length >= 6 && (
                        <p className="text-green-600 text-xs px-1 flex items-center gap-1">
                          <MdCheckCircle size={13} /> Senhas coincidem
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Botão Salvar ── */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-base transition-all shadow-lg ${
                    isSaving
                      ? "bg-gray-400 cursor-not-allowed shadow-none"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25 active:scale-[0.99]"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <MdSave size={20} />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          </form>
        </div>

        <SuccessModal
          isOpen={showSuccess}
          message="Suas alterações foram salvas com sucesso!"
          onClose={() => {
            setShowSuccess(false);
            router.push("/patient/profile");
          }}
        />

        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteAccount}
          isDeleting={isDeletingAccount}
        />
      </div>
    </main>
  );
}
