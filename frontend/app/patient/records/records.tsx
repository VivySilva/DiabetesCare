"use client";

import { useRouter } from "next/navigation";
import { MdBloodtype } from "react-icons/md";
import { LuPillBottle } from "react-icons/lu";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import RecordCategoryCard from "../../components/RecordCategoryCard";

export default function Registros() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header
        title="Registros"
        variant="page"
      />

      <section className="flex flex-col items-start px-[33px] pt-6 gap-10 w-full">
        <div className="flex flex-col items-start gap-2 w-full">
          <h1>Central de Registros</h1>
          <p className="m-0 text-cinza-claro-texto">
            Selecione uma categoria para registrar seus dados de saúde.
          </p>
        </div>

        <div className="flex flex-col gap-10 w-full">
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
