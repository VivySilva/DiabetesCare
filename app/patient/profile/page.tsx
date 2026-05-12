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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const handleExportPDF = async () => {
    setIsExporting(true);
    const token = localStorage.getItem("token");

    try {
      // 1. Buscar os dados do relatório na nossa nova API
      const response = await fetch("/api/reports/generate?period=30", {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar dados do relatório");

      const resData = await response.json();
      const { summary, aiTips, patientName } = resData.data;

      // 2. Iniciar a geração do PDF com jsPDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Cabeçalho do Relatório
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102); // Azul escuro
      doc.text("Relatório Clínico Individual", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`DiabetesCare - Gerado em: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.line(14, 32, pageWidth - 14, 32);

      // Info do Paciente
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text("Dados do Paciente", 14, 42);
      doc.setFont("helvetica", "normal");
      doc.text(`Nome: ${patientName}`, 14, 48);
      doc.text(`Período analisado: Últimos 30 dias`, 14, 54);

      // Tabela de Métricas Clínicas
      autoTable(doc, {
        startY: 65,
        head: [['Métrica', 'Valor']],
        body: [
          ['Média Glicêmica', `${summary.glucose_average} mg/dL`],
          ['Glicada Estimada (eAG)', `${summary.estimated_a1c}%`],
          ['Tempo no Alvo (TIR)', `${summary.time_in_range}%`],
          ['Variabilidade (SD)', `${summary.variability} mg/dL`],
          ['Episódios de Hipoglicemia', summary.hypoglycemia_events],
          ['Episódios de Hiperglicemia', summary.hyperglycemia_events],
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204] }
      });

      // Seção da Diabética (IA)
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 102, 102); // Verde azulado clínico
      doc.text("Análise Inteligente - Diabetica LLM", 14, finalY);
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      // Texto explicativo sobre quem gerou
      doc.setFontSize(9);
      doc.text("As dicas abaixo foram geradas automaticamente pela Diabetica (Large Language Model) com base nos seus dados:", 14, finalY + 7);
      
      doc.setFontSize(11);
      // Quebra de linha automática para o texto da IA
      const splitTips = doc.splitTextToSize(aiTips, pageWidth - 28);
      doc.text(splitTips, 14, finalY + 18);

      // Rodapé
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text("Este relatório é uma ferramenta de apoio e não substitui a consulta médica.", 14, doc.internal.pageSize.getHeight() - 10);

      // 3. Download do Arquivo
      doc.save(`Relatorio_DiabetesCare_${patientName.replace(/ /g, "_")}.pdf`);

    } catch (error) {
      console.error(error);
      alert("Houve um problema ao gerar seu relatório. Verifique sua conexão e tente novamente.");
    } finally {
      setIsExporting(false);
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
