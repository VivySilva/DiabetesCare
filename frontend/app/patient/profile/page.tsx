"use client";
import { useState } from "react";
import Link from "next/link";
import Avatar from "@/app/components/profile/avatar";
import InfoCard from "@/app/components/profile/info-card";
import LogoutModal from "@/app/components/modals/logout-modal";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import {
  MdOutlinePictureAsPdf,
  MdLogout,
} from "react-icons/md";

export default function PatientProfile() {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // 1. Criamos um estado para controlar se o sistema está gerando o PDF
  const [isExporting, setIsExporting] = useState(false);

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
        <Header
          title="DiabetesCare"
          titleColor="var(--dc-azul)"
          variant="home"
          notificationCount={3}
        />

        <section className="flex flex-col items-center mt-6 px-6">
          <Link href="/patient/profile/edit">
            <Avatar mode="view" />
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Ricardo Oliveira
          </h2>
          <span className="bg-blue-100 text-blue-600 text-[11px] font-bold px-3 py-1 rounded-full mt-2 tracking-wide uppercase">
            Paciente Tipo 2
          </span>

          <div className="flex w-full gap-4 mt-8">
            <InfoCard label="Idade" value="42 anos" />
            <InfoCard label="Gênero" value="Masculino" />
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
                  // Círculo girando enquanto carrega
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
          onConfirm={() => console.log("Saindo...")}
        />
        <Footer />
      </div>
    </main>
  );
}
