"use client";

import { useRouter } from "next/navigation";
import { MdBloodtype } from "react-icons/md";
import { LuPillBottle } from "react-icons/lu";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import RecordCategoryCard from "@/components/ui/RecordCategoryCard";

export default function RegistrosPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white pb-[91px] md:pb-12">
      <Header
        title="Registros"
        variant="page"
        showNotification={true}
      />

      {/* Centralized Container with Max Width */}
      <section className="w-full max-w-5xl mx-auto px-6 md:px-8 pt-6 pb-12 flex flex-col gap-10">
        
        {/* Title Area */}
        <div className="flex flex-col items-start gap-2 w-full">
          <h1 className="text-2xl md:text-3xl font-bold">Central de Registros</h1>
          <p className="m-0 text-cinza-claro-texto">
            Selecione uma categoria para registrar seus dados de saúde.
          </p>
        </div>

        {/* Dynamic Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <RecordCategoryCard
            href="/patient/records/glucose"
            icon={MdBloodtype}
            iconColor="var(--dc-vermelho)"
            iconBg="var(--dc-vermelho-fundo)"
            title="Glicemia"
            description="Monitore seus níveis de açúcar no sangue regularmente."
          />

          <RecordCategoryCard
            href="/patient/records/medications"
            icon={LuPillBottle}
            iconColor="var(--dc-verde)"
            iconBg="var(--dc-verde-fundo)"
            title="Remédios"
            description="Confirme a ingestão de comprimidos e outros medicamentos."
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
