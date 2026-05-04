"use client";
import React, { useState, useEffect } from "react";
import Avatar from "@/app/components/profile/avatar";
import { MdEdit, MdEmail, MdPhone } from "react-icons/md";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { getUserProfile, updateUserProfile } from "../../../../services/api";
import SuccessModal from "@/app/components/modals/success-modal";

export default function EditPatientProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Masculino");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // Email usually read-only in profile edit for security
  const [diabetesType, setDiabetesType] = useState("Tipo 2");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await getUserProfile(token);
        const u = res.user;
        setName(u.name || "");
        setAge(u.age?.toString() || "");
        setGender(u.gender || "Masculino");
        setPhone(u.phone || "");
        setEmail(u.email || "");
        setDiabetesType(u.diabetes_type || "Tipo 2");
        setAvatarUrl(u.avatar_url || "");
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsSaving(true);
    setError("");

    if (password && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setIsSaving(false);
      return;
    }

    try {
      await updateUserProfile({
        name,
        email,
        age: age ? parseInt(age) : null,
        gender,
        phone,
        diabetes_type: diabetesType,
        avatar_url: avatarUrl,
        password: password || undefined
      }, token);

      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header title="Editar Perfil" variant="page" showNotification={true} />
      <div className="max-w-md mx-auto w-full min-h-screen flex flex-col px-6 py-6 pb-24">

        <div className="flex flex-col items-center mb-8">
          <Avatar 
            src={avatarUrl} 
            mode="edit" 
            onImageSelected={(file) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
              };
              reader.readAsDataURL(file);
            }}
          />
          <span className="text-blue-500 text-sm font-medium mt-3">
            Alterar Foto de Perfil
          </span>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-sm text-center">{error}</div>}

        <form className="flex-1 flex flex-col gap-6" onSubmit={handleSave}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
              Nome Completo
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <MdEdit className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
              E-mail
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <MdEmail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
              Telefone
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <MdPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
              Segurança
            </label>
            
            <div className="flex flex-col gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nova Senha (deixe em branco para não alterar)"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar Nova Senha"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                Idade
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                Gênero
              </label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
              Tipo de Diabetes
            </label>
            {["Tipo 1", "Tipo 2", "Gestacional", "Pré-diabetes"].map((tipo) => (
              <label
                key={tipo}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  diabetesType === tipo ? "border-blue-600 bg-blue-50/30" : "border-gray-100 bg-white hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="diabetesType"
                  value={tipo}
                  checked={diabetesType === tipo}
                  onChange={() => setDiabetesType(tipo)}
                  className="w-5 h-5 accent-blue-600"
                />
                <span className={`font-medium ${diabetesType === tipo ? "text-blue-700" : "text-gray-900"}`}>
                  {tipo}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-6">
            <button 
              type="submit"
              disabled={isSaving}
              className={`w-full ${isSaving ? 'bg-gray-400' : 'bg-blue-600'} text-white font-bold py-4 rounded-full shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all`}
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>

        <SuccessModal 
          isOpen={showSuccess} 
          message="Suas alterações foram salvas com sucesso no seu perfil." 
          onClose={() => {
            setShowSuccess(false);
            router.push("/patient/profile");
          }} 
        />
      </div>
    </main>
  );
}

