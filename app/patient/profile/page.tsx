"use client";
import { useState } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/profile/avatar";
import InfoCard from "@/components/ui/profile/info-card";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import LogoutModal from "@/components/ui/modals/logout-modal";
import {
  MdOutlinePictureAsPdf,
  MdLogout,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/services/user/userService";
import { useEffect } from "react";

export default function PatientProfile() {
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // 2. Esta é a função que "conversa" com o backend
  const handleExportPDF = async () => {
    setIsExporting(true); // Começa o carregamento

    try {
      // O 'fetch' faz o pedido para o seu servidor
      const response = await fetch("SUA_URL_DO_BACKEND_AQUI", {
        method: "GET",
        // Caso precise de login: headers: { "Authorization": "Bearer ..." }
      });

      if (!response.ok) throw new Error("Erro ao baixar PDF");

      // Transformamos a resposta em um "Blob" (um arquivo bruto)
      const blob = await response.blob();

      // Criamos um link "invisível" para forçar o navegador a baixar o arquivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "meu_relatorio_diabetes.pdf"; // Nome que o usuário verá ao salvar
      document.body.appendChild(link);
      link.click(); // Simula o clique de download

      // Limpamos a memória
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar o relatório. Tente novamente.");
    } finally {
      setIsExporting(false); // Para o carregamento, dando certo ou errado
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px] md:pb-12">
      {/* Centralized Container with Max Width */}
      <div className="max-w-5xl mx-auto w-full bg-[#F8F9FA] min-h-screen relative flex flex-col">
        <Header title="DiabetesCare" titleColor="var(--dc-azul)" variant="page" showNotification={true} />

        {/* Responsive Grid Layout */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 px-6 pb-12 items-start">
          
          {/* Column 1: Profile Summary & Main Actions */}
          <div className="md:col-span-1 flex flex-col items-center bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <Link href="/patient/profile/edit" className="transition-transform hover:scale-105">
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
                  {user?.name || "Usuário"}
                </h2>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full mt-2 tracking-wide uppercase">
                  {user?.role === "PROFESSIONAL" ? "Especialista" : user?.diabetes_type || "Paciente"}
                </span>
              </>
            )}

            {/* Quick Action Buttons */}
            <div className="w-full bg-gray-50 rounded-[24px] p-2 mt-6 flex flex-col gap-1">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                  isExporting
                    ? "bg-gray-200 opacity-70"
                    : "bg-transparent hover:bg-gray-200 text-blue-700 font-semibold"
                }`}
              >
                <div className="flex items-center gap-3 text-sm">
                  {isExporting ? (
                    <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <MdOutlinePictureAsPdf size={20} />
                  )}
                  <span>
                    {isExporting ? "Gerando..." : "Exportar Relatório"}
                  </span>
                </div>
                {!isExporting && <span className="text-gray-400 text-sm">›</span>}
              </button>

              <button
                onClick={() => setIsLogoutOpen(true)}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-transparent hover:bg-red-50 text-red-600 font-semibold text-sm transition-colors"
              >
                <MdLogout size={20} />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>

          {/* Column 2 & 3: Info Cards / Details Section */}
          <div className="md:col-span-2 flex flex-col gap-6 bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h3 className="text-lg font-bold text-gray-900 mb-2 pb-3 border-b border-gray-100">Informações Pessoais</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard label="Idade" value={user?.age ? `${user.age} anos` : "Não informado"} />
              <InfoCard label="Gênero" value={user?.gender || "Não informado"} />
            </div>

            <div className="flex flex-col gap-4">
              <InfoCard label="E-mail" value={user?.email || "Não informado"} />
              <InfoCard label="Telefone" value={user?.phone || "Não informado"} />
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
