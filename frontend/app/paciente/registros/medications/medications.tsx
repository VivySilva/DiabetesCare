"use client";

import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function CadastroRemedios() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header
        title="Remédios"
        variant="page"
        onIconClick={() => router.back()}
      />

      <section className="flex flex-col items-start px-[33px] pt-6 gap-6 w-full">
        <div className="flex flex-col gap-2 w-full">
          <h1>Cadastro de Remédios</h1>
          <p className="m-0 text-cinza-claro-texto">
            Confirme a ingestão de comprimidos e outros medicamentos.
          </p>
        </div>

        {/* Formulário de cadastro de remédios — em breve */}
      </section>

      <Footer />
    </main>
  );
}
