"use client";
import { useState } from "react";
import Link from "next/link";
import Avatar from "@/app/components/profile/avatar";
import InfoCard from "@/app/components/profile/info-card";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import LogoutModal from "@/app/components/modals/logout-modal";
import {
  MdOutlinePictureAsPdf,
  MdLogout,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import { getUserProfile } from "../../../services/api";
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
    <main className="min-h-screen bg-[#F8F9FA] pb-[100px]">
      <div className="max-w-md mx-auto w-full bg-[#F8F9FA] min-h-screen relative">
        <Header title="DiabetesCare" titleColor="var(--dc-azul)" variant="page" showNotification={true} />

        <section className="flex flex-col items-center mt-6 px-6">
          <Link href="/patient/profile/edit">
            <Avatar mode="view" src={user?.avatar_url} />
          </Link>

          {isLoading ? (
            <div className="flex flex-col items-center mt-4 gap-2">
              <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mt-4 text-center">
                {user?.name || "Usuário"}
              </h2>
              <span className="bg-blue-100 text-blue-600 text-[11px] font-bold px-3 py-1 rounded-full mt-2 tracking-wide uppercase">
                {user?.role === "PROFESSIONAL" ? "Especialista" : user?.diabetes_type || "Paciente"}
              </span>
            </>
          )}

          <div className="flex w-full gap-4 mt-8">
            <InfoCard label="Idade" value={user?.age ? `${user.age} anos` : "Não informado"} />
            <InfoCard label="Gênero" value={user?.gender || "Não informado"} />
          </div>

          <div className="w-full mt-4 flex flex-col gap-4">
            <InfoCard label="E-mail" value={user?.email || "Não informado"} />
            <InfoCard label="Telefone" value={user?.phone || "Não informado"} />
          </div>

          <div className="w-full bg-gray-100 rounded-[24px] p-2 mt-8 flex flex-col gap-1">
            {/* 3. O Botão atualizado com a lógica de clique e loading */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                isExporting
                  ? "bg-gray-200 opacity-70"
                  : "bg-transparent hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 text-blue-700 font-semibold">
                {isExporting ? (
                  <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <MdOutlinePictureAsPdf size={22} />
                )}
                <span>
                  {isExporting ? "Gerando..." : "Exportar Relatório PDF"}
                </span>
              </div>
              {!isExporting && <span className="text-gray-400">›</span>}
            </button>

            <button
              onClick={() => setIsLogoutOpen(true)}
              className="flex items-center gap-3 p-4 rounded-2xl bg-transparent hover:bg-gray-200 transition-colors text-red-600 font-semibold"
            >
              <MdLogout size={22} />
              <span>Sair da Conta</span>
            </button>
          </div>
        </section>

        <LogoutModal
          isOpen={isLogoutOpen}
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={() => router.push("/login")}
        />
        <Footer />
      </div>
    </main>
  );
}
